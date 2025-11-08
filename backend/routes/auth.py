from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
import uuid
import re
from datetime import datetime
from services.otp_service import OTPService
from services.email_service import EmailService
# from services.sms_service import SMSService

auth_bp = Blueprint("auth", __name__)



# Blacklist for tokens (in-memory; use Redis in production)
blacklisted_tokens = set()

# Reset tokens (simulate password reset)
reset_tokens = {}

# ========================= ROLE CHECKING UTILITIES =========================


def is_super_admin(email):
    """Check if user is super admin"""
    try:
        db = current_app.config["MONGO_DB"]
        admin = db.admins.find_one({"email": email, "role": "super_admin"})
        return admin is not None
    except Exception as e:
        current_app.logger.error(f"Super admin check error: {str(e)}")
        return False


def is_sub_admin(email):
    """Check if user is sub admin"""
    try:
        db = current_app.config["MONGO_DB"]
        admin = db.admins.find_one({"email": email, "role": "sub_admin"})
        return admin is not None
    except Exception as e:
        current_app.logger.error(f"Sub admin check error: {str(e)}")
        return False


def is_student(email):
    """Check if user is student"""
    try:
        db = current_app.config["MONGO_DB"]
        student = db.students.find_one({"email": email})
        return student is not None
    except Exception as e:
        current_app.logger.error(f"Student check error: {str(e)}")
        return False

# Initialize super admin when module loads


@auth_bp.before_app_request
def initialize_super_admin():
    create_initial_super_admin()


def validate_college_email(email):
    """Validate college email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@bvmengineering\.ac\.in$'
    return re.match(pattern, email) is not None

# ========================= SUPER ADMIN INITIAL SETUP =========================
def create_initial_super_admin():
    """Create initial super admin if not exists"""
    try:
        db = current_app.config["MONGO_DB"]

        # Check if super admin already exists in admins collection
        existing_super_admin = db.admins.find_one({"role": "super_admin"})
        if existing_super_admin:
            return

        # Create initial super admin in admins collection
        super_admin_data = {
            "adminId": "SUPER_ADMIN_001",
            "email": "tpc@bvmengineering.ac.in",
            # Change this initial password
            "password": generate_password_hash("admin123"),
            "name": "TPC Coordinator",
            "role": "super_admin",
            "department": "TPC Cell",
            "permissions": [
                "manage_all", "create_sub_admin", "remove_sub_admin",
                "manage_companies", "view_analytics", "manage_users"
            ],
            "is_active": True,
            "createdBy": "system",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }

        db.admins.insert_one(super_admin_data)
        current_app.logger.info("Initial super admin created successfully")

    except Exception as e:
        current_app.logger.error(
            f"Error creating initial super admin: {str(e)}")


# ========================= REGISTER =========================
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        print("Data:", data)

        # Debug logging
        current_app.logger.info(f"Registration attempt with data: {data}")

        if not data:
            return jsonify({"success": False, "message": "No JSON data provided"}), 400

        # Extract all fields from the form
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()
        student_id = data.get("studentId", "").strip()
        full_name = data.get("fullName", "").strip()
        phone = data.get("phone", "").strip()

        # Debug: Check OTP data
        otp_data = otp_service.get_otp_data(email)
        print(f"OTP Data for {email}: {otp_data}")

        # Check if email is verified via OTP - FIXED: use 'email_verified' instead of 'verified'
        
        if not otp_data or not otp_data.get('email_verified'):
            print(f"Email not verified. OTP data: {otp_data}")
            return jsonify({"success": False, "message": "Email verification required"}), 400

        # Validate all required fields
        required_fields = {
            "email": email,
            "password": password,
            "studentId": student_id,
            "fullName": full_name,
            "phone": phone
        }

        for field, value in required_fields.items():
            if not value:
                return jsonify({"success": False, "message": f"{field} is required"}), 400

        # Validate college email format
        if not validate_college_email(email):
            return jsonify({"success": False, "message": "Please use a valid BVM college email address"}), 400

        # Check password length
        if len(password) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 characters long"}), 400

        # Validate phone number (basic validation)
        if not phone.isdigit() or len(phone) < 10:
            return jsonify({"success": False, "message": "Please enter a valid phone number"}), 400

        db = current_app.config["MONGO_DB"]

        # Check if student already exists with this email
        existing_student_by_email = db.students.find_one({"email": email})
        if existing_student_by_email:
            return jsonify({"success": False, "message": "Student with this email already exists"}), 409

        # Check if student ID already exists
        existing_student_by_id = db.students.find_one(
            {"studentId": student_id})
        if existing_student_by_id:
            return jsonify({"success": False, "message": "Student ID already exists"}), 409

        # Create new student document matching your database structure
        new_student = {
            "studentId": student_id,
            "name": full_name,  # Using "name" field as per your database
            "email": email,
            # Using "password" field as per your database
            "password": generate_password_hash(password),
            "phone": phone,
            "branch": "",  # Will be filled in setup
            "cgpa": 0.0,   # Will be filled in setup
            "skills": [],   # Empty array initially
            "resume": "",   # Empty string initially
            "placementsApplied": [],  # Empty array initially
            "placementsSelected": [],  # Empty array initially
            "status": "Not Placed",   # Default status
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            # Additional fields for internal tracking
            "is_setup_complete": False,  # Flag to track setup completion
            "semester": 0,  # Will be filled in setup
            "niche": "",    # Will be filled in setup
            "career_path": "",  # Will be filled in setup
            "email_verified": True,
            "phone_verified": True,
            "role": "student",
            "is_sub_admin": False
        }

        # Insert into students collection
        result = db.students.insert_one(new_student)

        # Clear OTP data after successful registration
        otp_service.delete_otp_data(email)

        # Create tokens for immediate login
        access_token = create_access_token(identity=email)
        refresh_token = create_refresh_token(identity=email)

        return jsonify({
            "success": True,
            "message": "Registration successful. Please complete your profile setup.",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "email": email,
                "student_id": student_id,
                "name": full_name,
                "is_setup_complete": False,
                "role": "student",
                "is_sub_admin": False
            },
            "redirect_url": "/setup"
        }), 201

    except Exception as e:
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


# ========================= LOGIN =========================
# auth.py - Update the login function

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        print("Login Data:", data)
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()
        print("email",email,"password",password)

        if not email or not password:
            return jsonify({"success": False, "message": "Email and password are required"}), 400

        db = current_app.config["MONGO_DB"]

        # First check in admins collection
        admin = db.admins.find_one({"email": email, "is_active": True})
        print(admin)
        if admin:
            if check_password_hash(admin["password"], password):
                return handle_admin_login(admin, email, db)
            else:
                return jsonify({"success": False, "message": "Invalid credentials"}), 401

        # If not admin, check in students collection
        if not validate_college_email(email):
            return jsonify({"success": False, "message": "Please use a valid BVM college email address"}), 400

        student = db.students.find_one({"email": email})
        print("Student found:", student)
        if not student:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        if not check_password_hash(student["password"], password):
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        return handle_student_login(student, email, db)

    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


def handle_admin_login(admin, email, db):
    """Handle admin login (both super_admin and sub_admin)"""
    # Update last login
    db.admins.update_one(
        {"email": email},
        {"$set": {"lastLogin": datetime.utcnow()}}
    )

    # Create tokens
    access_token = create_access_token(identity=email)
    refresh_token = create_refresh_token(identity=email)

    admin_data = {
        "email": admin["email"],
        "name": admin.get("name", "Admin"),
        "admin_id": admin.get("adminId", ""),
        "role": admin.get("role", "admin"),
        "permissions": admin.get("permissions", []),
        "is_setup_complete": True,
        "is_sub_admin": admin.get("role") == "sub_admin"
    }

    # Set redirect URL based on role
    if admin["role"] == "super_admin":
        redirect_url = "/super-admin/dashboard"
    else:  # sub_admin
        redirect_url = "/dashboard"
        # Add student info for sub_admins (who are also students)
        student_data = db.students.find_one({"email": email})
        if student_data:
            admin_data.update({
                "student_id": student_data.get("studentId"),
                "department": student_data.get("branch", ""),
                "semester": student_data.get("semester", 0)
            })

    return jsonify({
        "success": True,
        "message": f"{admin['role'].replace('_', ' ').title()} login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": admin_data,
        "redirect_url": redirect_url
    }), 200

def handle_student_login(student, email, db):
    """Handle student login"""
    # Create tokens
    access_token = create_access_token(identity=email)
    refresh_token = create_refresh_token(identity=email)

    student_data = {
        "email": student["email"],
        "name": student.get("name", ""),
        "student_id": student["studentId"],
        "role": student.get("role", "student"),
        "is_setup_complete": student.get("is_setup_complete", False),
        "branch": student.get("branch", ""),
        "semester": student.get("semester", 0),
        "is_sub_admin": student.get("is_sub_admin", False)
    }
    
    redirect_url = "/dashboard" if student.get("is_setup_complete", False) else "/setup"

    return jsonify({
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": student_data,
        "redirect_url": redirect_url
    }), 200
    
    
# ========================= COMPLETE SETUP =========================
@auth_bp.route("/complete-setup", methods=["POST"])
@jwt_required()
def complete_setup():
    try:
        current_user = get_jwt_identity()
        data = request.get_json()

        required_fields = [
             "department", "semester", "cpi", "niche", "careerPath"
        ]

        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                return jsonify({"success": False, "message": f"{field} is required"}), 400

        db = current_app.config["MONGO_DB"]

        # Update student profile with setup data in students collection
        update_data = {
            "branch": data["department"].strip(),
            "semester": int(data["semester"]),
            "cgpa": float(data["cpi"]),
            "niche": data["niche"].strip(),
            "career_path": data["careerPath"].strip(),
            "is_setup_complete": True,
            "updated_at": datetime.utcnow()
        }

        # Add optional fields if provided
        optional_fields = ["phone", "linkedin_url",
                           "github_url", "portfolio_url"]
        for field in optional_fields:
            if field in data and data[field]:
                update_data[field] = data[field].strip()

        result = db.students.update_one(
            {"email": current_user},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            return jsonify({"success": False, "message": "Student not found or no changes made"}), 404

        return jsonify({
            "success": True,
            "message": "Profile setup completed successfully",
            "redirect_url": "/dashboard"
        }), 200

    except ValueError as e:
        return jsonify({"success": False, "message": "Invalid data format for semester or CPI"}), 400
    except Exception as e:
        current_app.logger.error(f"Setup completion error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


# ========================= REFRESH =========================
@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user)
        return jsonify({"access_token": new_access_token}), 200
    except Exception as e:
        current_app.logger.error(f"Token refresh error: {str(e)}")
        return jsonify({"success": False, "message": "Token refresh failed"}), 500


# ========================= LOGOUT =========================
@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    try:
        jti = get_jwt()["jti"]
        blacklisted_tokens.add(jti)
        return jsonify({"success": True, "message": "Logged out successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Logout error: {str(e)}")
        return jsonify({"success": False, "message": "Logout failed"}), 500


# JWT blacklist check
@auth_bp.before_app_request
def setup_callbacks():
    jwt = current_app.extensions.get("jwt")

    if jwt:
        @jwt.token_in_blocklist_loader
        def check_if_token_revoked(jwt_header, jwt_payload):
            return jwt_payload["jti"] in blacklisted_tokens


# ========================= FORGOT PASSWORD =========================
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get("email", "").strip()

        if not email or not validate_college_email(email):
            return jsonify({"success": False, "message": "Valid college email is required"}), 400

        db = current_app.config["MONGO_DB"]
        student = db.students.find_one({"email": email})

        if not student:
            # Don't reveal that student doesn't exist for security
            return jsonify({
                "success": True,
                "message": "If the email exists, a reset link has been sent"
            }), 200

        reset_token = str(uuid.uuid4())
        reset_tokens[email] = reset_token

        # In production, send email here
        current_app.logger.info(
            f"Password reset token for {email}: {reset_token}")

        return jsonify({
            "success": True,
            "message": "If the email exists, a reset link has been sent",
            "reset_token": reset_token  # Only for development
        }), 200

    except Exception as e:
        current_app.logger.error(f"Forgot password error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


# ========================= RESET PASSWORD =========================
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.get_json()
        email = data.get("email", "").strip()
        reset_token = data.get("reset_token", "").strip()
        new_password = data.get("new_password", "").strip()

        if not email or not reset_token or not new_password:
            return jsonify({"success": False, "message": "All fields are required"}), 400

        if not validate_college_email(email):
            return jsonify({"success": False, "message": "Valid college email is required"}), 400

        if len(new_password) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 characters long"}), 400

        if email not in reset_tokens or reset_tokens[email] != reset_token:
            return jsonify({"success": False, "message": "Invalid or expired reset token"}), 400

        db = current_app.config["MONGO_DB"]
        hashed_password = generate_password_hash(new_password)

        result = db.students.update_one(
            {"email": email},
            {"$set": {"password_hash": hashed_password, "updated_at": datetime.utcnow()}}
        )

        if result.modified_count == 0:
            return jsonify({"success": False, "message": "Student not found"}), 404

        del reset_tokens[email]

        return jsonify({"success": True, "message": "Password reset successful"}), 200

    except Exception as e:
        current_app.logger.error(f"Reset password error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


# ========================= PROFILE (Protected) =========================
@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    try:
        current_user = get_jwt_identity()
        db = current_app.config["MONGO_DB"]

        student = db.students.find_one(
            {"email": current_user},
            {"password_hash": 0}  # Exclude password hash
        )

        if not student:
            return jsonify({"success": False, "message": "Student not found"}), 404

        # Convert ObjectId to string if it exists (though we're using custom _id)
        if "_id" in student:
            student["_id"] = str(student["_id"])

        return jsonify({"success": True, "user": student}), 200

    except Exception as e:
        current_app.logger.error(f"Profile fetch error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


# ========================= UPDATE PROFILE =========================
@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    try:
        current_user = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400

        db = current_app.config["MONGO_DB"]

        # Fields that can be updated
        allowed_fields = [
            "full_name", "department", "semester", "cpi", "niche", "career_path",
            "phone", "linkedin_url", "github_url", "portfolio_url", "skills",
            "resume_url", "profile_picture_url"
        ]

        update_data = {"updated_at": datetime.utcnow()}

        for field in allowed_fields:
            if field in data and data[field] is not None:
                if field in ["semester", "cpi"]:
                    update_data[field] = data[field]
                else:
                    update_data[field] = str(data[field]).strip()

        result = db.students.update_one(
            {"email": current_user},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            return jsonify({"success": False, "message": "No changes made or student not found"}), 404

        return jsonify({"success": True, "message": "Profile updated successfully"}), 200

    except Exception as e:
        current_app.logger.error(f"Profile update error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


# ========================= CHECK AUTH STATUS =========================
@auth_bp.route("/check-auth", methods=["GET"])
@jwt_required()
def check_auth():
    try:
        current_user = get_jwt_identity()
        db = current_app.config["MONGO_DB"]

        # First check in admins collection
        admin = db.admins.find_one({"email": current_user})
        if admin:
            return jsonify({
                "success": True,
                "authenticated": True,
                "user": {
                    "email": admin["email"],
                    "name": admin.get("name", "Admin"),
                    "role": admin.get("role", "admin"),
                    "admin_id": admin.get("adminId", ""),
                    "permissions": admin.get("permissions", []),
                    "is_setup_complete": True
                }
            }), 200

        # Check in students collection
        student = db.students.find_one({"email": current_user})
        if student:
            return jsonify({
                "success": True,
                "authenticated": True,
                "user": {
                    "email": student["email"],
                    "name": student.get("name", ""),
                    "role": student.get("role", "student"),
                    "student_id": student["studentId"],
                    "is_setup_complete": student.get("is_setup_complete", False),
                    "is_sub_admin": student.get("is_sub_admin", False),
                    "branch": student.get("branch", ""),
                    "semester": student.get("semester", 0)
                }
            }), 200

        return jsonify({"success": False, "authenticated": False}), 401

    except Exception as e:
        return jsonify({"success": False, "authenticated": False}), 401


# ========================= DELETE ACCOUNT =========================
@auth_bp.route("/delete-account", methods=["DELETE"])
@jwt_required()
def delete_account():
    try:
        current_user = get_jwt_identity()
        db = current_app.config["MONGO_DB"]

        result = db.students.delete_one({"email": current_user})

        if result.deleted_count == 0:
            return jsonify({"success": False, "message": "Student not found"}), 404

        # Also blacklist the token
        jti = get_jwt()["jti"]
        blacklisted_tokens.add(jti)

        return jsonify({"success": True, "message": "Account deleted successfully"}), 200

    except Exception as e:
        current_app.logger.error(f"Delete account error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500
    
    
    # ========================= GET USER PROFILE =========================
@auth_bp.route("/user/profile", methods=["GET"])
@jwt_required()
def get_user_profile():
    try:
        current_user = get_jwt_identity()
        db = current_app.config["MONGO_DB"]

        # Find student by email (current_user is the email from JWT)
        student = db.students.find_one(
            {"email": current_user},
            {"password": 0}  # Exclude password field
        )

        if not student:
            return jsonify({"success": False, "message": "User not found"}), 404

        # Format the response to match your frontend structure
        user_data = {
            "studentId": student.get("studentId", ""),
            "fullName": student.get("name", ""),
            "email": student.get("email", ""),
            # Map branch to department
            "department": student.get("branch", ""),
            "semester": str(student.get("semester", 0)),
            "cpi": str(student.get("cgpa", 0.0)),  # Map cgpa to cpi
            "niche": student.get("niche", ""),
            "careerPath": student.get("career_path", ""),
            "phone": student.get("phone", ""),
            "bio": student.get("bio", "Passionate about technology and innovation."),
            "is_setup_complete": student.get("is_setup_complete", False)
        }

        return jsonify({
            "success": True,
            "user": user_data
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get user profile error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


# ========================= UPDATE USER PROFILE =========================
@auth_bp.route("/user/profile", methods=["PUT"])
@jwt_required()
def update_user_profile():
    try:
        current_user = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400

        db = current_app.config["MONGO_DB"]

        # Map frontend field names to database field names
        update_data = {"updatedAt": datetime.utcnow()}

        field_mapping = {
            "fullName": "name",
            "department": "branch",
            "cpi": "cgpa",
            "careerPath": "career_path"
        }

        # Handle regular fields
        regular_fields = ["fullName", "department", "semester",
                          "cpi", "niche", "careerPath", "phone", "bio"]

        for field in regular_fields:
            if field in data and data[field] is not None:
                db_field = field_mapping.get(field, field)
                if field in ["semester", "cpi"]:
                    try:
                        update_data[db_field] = float(
                            data[field]) if field == "cpi" else int(data[field])
                    except ValueError:
                        return jsonify({"success": False, "message": f"Invalid format for {field}"}), 400
                else:
                    update_data[db_field] = str(data[field]).strip()

        result = db.students.update_one(
            {"email": current_user},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            return jsonify({"success": False, "message": "No changes made or user not found"}), 404

        return jsonify({
            "success": True,
            "message": "Profile updated successfully"
        }), 200

    except Exception as e:
        current_app.logger.error(f"Update profile error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


otp_service = OTPService()
email_service = EmailService()
# sms_service = SMSService()


# ========================= SEND EMAIL OTP =========================
@auth_bp.route("/send-email-otp", methods=["POST"])
def send_email_otp():
    otp_service = OTPService()
    email_service = EmailService()
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "message": "No JSON data provided"}), 400

        email = data.get("email", "").strip()

        if not email:
            return jsonify({"success": False, "message": "Email is required"}), 400

        if not validate_college_email(email):
            return jsonify({"success": False, "message": "Please use a valid BVM college email address"}), 400

        # Check if email already exists
        db = current_app.config.get("MONGO_DB")
        existing_student = db.students.find_one({"email": email})
        if existing_student:
            return jsonify({"success": False, "message": "Email already registered"}), 409

        # Generate email OTP
        email_otp = otp_service.generate_otp()

        # Store email OTP in Redis
        success = otp_service.store_email_otp(email, email_otp)

        if not success:
            return jsonify({"success": False, "message": "Failed to store OTP"}), 500

        # Send email OTP
        email_sent = email_service.send_otp_email(email, email_otp)

        if email_sent:
            return jsonify({
                "success": True,
                "message": "OTP sent successfully to your email",
                "expires_in": 600
            }), 200
        else:
            otp_service.delete_otp_data(email)
            return jsonify({"success": False, "message": "Failed to send email OTP"}), 500

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": "Internal server error"}), 500

# ========================= SEND PHONE OTP =========================


# @auth_bp.route("/send-phone-otp", methods=["POST"])
# def send_phone_otp():
#     print("\n🟢 [DEBUG] --- /send-phone-otp route hit ---")
#     otp_service = OTPService()
#     sms_service = SMSService()
#     try:
#         data = request.get_json()
#         print(f"📩 [DEBUG] Raw request data: {data}")

#         if not data:
#             return jsonify({"success": False, "message": "No JSON data provided"}), 400

#         phone = data.get("phone", "").strip()
#         email = data.get("email", "").strip()  # We need email to store OTP
#         print(f"📱 [DEBUG] Phone: {phone}")
#         print(f"📧 [DEBUG] Email (for storage): {email}")

#         if not phone or not email:
#             return jsonify({"success": False, "message": "Phone and email are required"}), 400

#         if not phone.isdigit() or len(phone) < 10:
#             return jsonify({"success": False, "message": "Please enter a valid phone number"}), 400

#         # Check if email exists in database (user should verify email first)
#         db = current_app.config.get("MONGO_DB")
#         existing_student = db.students.find_one({"email": email})
#         if existing_student:
#             return jsonify({"success": False, "message": "Email already registered"}), 409

#         # Generate phone OTP
#         phone_otp = otp_service.generate_otp()
#         print(f"🔢 [DEBUG] Generated Phone OTP: {phone_otp}")

#         # Store phone OTP in Redis
#         success = otp_service.store_phone_otp(email, phone, phone_otp)
#         print(f"✅ [DEBUG] Phone OTP stored in Redis: {success}")

#         if not success:
#             return jsonify({"success": False, "message": "Failed to store OTP"}), 500

#         # Send phone OTP
#         print("📲 [DEBUG] Sending SMS OTP...")
#         sms_sent = sms_service.send_otp_sms(phone, phone_otp)
#         print(f"📩 [DEBUG] SMS send status: {sms_sent}")

#         if sms_sent:
#             return jsonify({
#                 "success": True,
#                 "message": "OTP sent successfully to your phone",
#                 "expires_in": 600
#             }), 200
#         else:
#             otp_service.delete_otp_data(email)
#             return jsonify({"success": False, "message": "Failed to send SMS OTP"}), 500

#     except Exception as e:
#         print(f"💥 [DEBUG] Send Phone OTP Error: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({"success": False, "message": "Internal server error"}), 500

# ========================= VERIFY EMAIL OTP =========================


@auth_bp.route("/verify-email-otp", methods=["POST"])
def verify_email_otp():
    otp_service = OTPService()

    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "message": "No JSON data provided"}), 400

        email = data.get("email", "").strip()
        email_otp = data.get("email_otp", "").strip()

        if not email or not email_otp:
            return jsonify({"success": False, "message": "Email and OTP are required"}), 400

        # Check if OTP exists in Redis
        otp_data = otp_service.get_otp_data(email)

        if not otp_data:
            return jsonify({"success": False, "message": "OTP not found or expired"}), 404

        # Check if email OTP exists in the data
        if 'email_otp' not in otp_data:
            return jsonify({"success": False, "message": "Email OTP not found or expired"}), 404

        # Check attempt limit
        current_attempts = otp_data.get('email_attempts', 0)
        if current_attempts >= 3:
            otp_service.delete_otp_data(email)
            return jsonify({"success": False, "message": "Too many failed attempts. Please request a new OTP."}), 400

        # Verify email OTP
        if otp_data['email_otp'] == email_otp:
            # Mark email as verified
            success = otp_service.mark_email_verified(email)
            if success:
                return jsonify({
                    "success": True,
                    "message": "Email verified successfully",
                    "verified": True
                }), 200
            else:
                return jsonify({"success": False, "message": "Failed to mark email as verified"}), 500
        else:
            # Increment attempt counter
            otp_service.increment_email_attempts(email)
            remaining_attempts = 2 - current_attempts  # -1 because we just failed one
            return jsonify({
                "success": False,
                "message": f"Invalid OTP. {remaining_attempts} attempts remaining."
            }), 400

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": "Internal server error"}), 500

# ========================= VERIFY PHONE OTP =========================


# @auth_bp.route("/send-phone-otp", methods=["POST"])
# def send_phone_otp():
#     print("\n🟢 [DEBUG] --- /send-phone-otp route hit ---")
#     otp_service = OTPService()

#     try:
#         data = request.get_json()
#         print(f"📩 [DEBUG] Raw request data: {data}")

#         if not data:
#             return jsonify({"success": False, "message": "No JSON data provided"}), 400

#         phone = data.get("phone", "").strip()
#         email = data.get("email", "").strip()
#         print(f"📱 [DEBUG] Phone: {phone}")
#         print(f"📧 [DEBUG] Email (for storage): {email}")

#         if not phone or not email:
#             return jsonify({"success": False, "message": "Phone and email are required"}), 400

#         # Format phone number for Twilio (add country code if missing)
#         formatted_phone = phone
#         if not phone.startswith('+'):
#             # Assuming Indian numbers - add +91 country code
#             if len(phone) == 10 and phone.isdigit():
#                 formatted_phone = f"+91{phone}"
#                 print(f"🌍 [DEBUG] Formatted phone: {formatted_phone}")
#             else:
#                 return jsonify({"success": False, "message": "Please enter a valid 10-digit phone number"}), 400

#         # Check if email exists in database
#         db = current_app.config.get("MONGO_DB")
#         existing_student = db.students.find_one({"email": email})
#         if existing_student:
#             return jsonify({"success": False, "message": "Email already registered"}), 409

#         # Start Twilio verification (no manual OTP generation)
#         print("📲 [DEBUG] Starting Twilio verification...")
#         verification_started = otp_service.start_phone_verification(
#             email, formatted_phone)
#         print(f"📩 [DEBUG] Verification start status: {verification_started}")

#         if verification_started:
#             return jsonify({
#                 "success": True,
#                 "message": "Verification code sent successfully to your phone",
#                 "expires_in": 600
#             }), 200
#         else:
#             return jsonify({"success": False, "message": "Failed to send verification code"}), 500

#     except Exception as e:
#         print(f"💥 [DEBUG] Send Phone OTP Error: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({"success": False, "message": "Internal server error"}), 500


# @auth_bp.route("/verify-phone-otp", methods=["POST"])
# def verify_phone_otp():
#     otp_service = OTPService()
#     try:
#         data = request.get_json()
#         print(f"📩 [DEBUG] Verify Phone OTP data: {data}")

#         if not data:
#             return jsonify({"success": False, "message": "No JSON data provided"}), 400

#         email = data.get("email", "").strip()
#         phone_otp = data.get("phone_otp", "").strip()
#         phone = data.get("phone", "").strip()

#         if not email or not phone_otp or not phone:
#             return jsonify({"success": False, "message": "Email, phone and OTP are required"}), 400

#         # Format phone number consistently
#         formatted_phone = phone
#         if not phone.startswith('+') and len(phone) == 10 and phone.isdigit():
#             formatted_phone = f"+91{phone}"

#         # Check if verification session exists in Redis
#         otp_data = otp_service.get_otp_data(email)
#         print(f"🧠 [DEBUG] Retrieved OTP data: {otp_data}")

#         if not otp_data:
#             return jsonify({"success": False, "message": "Verification session not found or expired"}), 404

#         # Verify phone matches (compare with formatted version)
#         if otp_data.get('phone') != formatted_phone:
#             return jsonify({"success": False, "message": "Phone number mismatch"}), 400

#         # Check attempt limit
#         current_attempts = otp_data.get('phone_attempts', 0)
#         if current_attempts >= 3:
#             otp_service.delete_otp_data(email)
#             return jsonify({"success": False, "message": "Too many failed attempts. Please request a new code."}), 400

#         # Verify using Twilio with formatted phone
#         is_verified = otp_service.verify_phone_code(
#             email, formatted_phone, phone_otp)

#         if is_verified:
#             return jsonify({
#                 "success": True,
#                 "message": "Phone verified successfully",
#                 "verified": True
#             }), 200
#         else:
#             # Get updated attempt count for message
#             updated_data = otp_service.get_otp_data(email)
#             remaining_attempts = 3 - \
#                 (updated_data.get('phone_attempts', 0)
#                  if updated_data else current_attempts + 1)
#             return jsonify({
#                 "success": False,
#                 "message": f"Invalid verification code. {remaining_attempts} attempts remaining."
#             }), 400

#     except Exception as e:
#         print(f"💥 [DEBUG] Verify Phone OTP Error: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({"success": False, "message": "Internal server error"}), 500
