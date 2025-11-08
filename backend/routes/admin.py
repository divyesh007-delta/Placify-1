from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from datetime import datetime
import uuid
from .auth import create_initial_super_admin

admin_bp = Blueprint("admin", __name__)


def is_sub_admin(email):
    """Check if user is sub admin"""
    try:
        db = current_app.config["MONGO_DB"]
        admin = db.admins.find_one({"email": email, "role": "sub_admin"})
        return admin is not None
    except Exception as e:
        current_app.logger.error(f"Sub admin check error: {str(e)}")
        return False

def is_super_admin(email):
    """Check if user is super admin"""
    try:
        db = current_app.config["MONGO_DB"]
        admin = db.admins.find_one({"email": email, "role": "super_admin"})
        return admin is not None
    except Exception as e:
        current_app.logger.error(f"Super admin check error: {str(e)}")
        return False

# ========================= SUPER ADMIN ROUTES =========================


@admin_bp.route("/super-admin/sub-admins", methods=["POST"])
@jwt_required()
def create_sub_admin():
    """Super admin creates sub admin from existing students"""
    try:
        current_user = get_jwt_identity()

        # Verify super admin
        if not is_super_admin(current_user):
            return jsonify({"success": False, "message": "Super admin access required"}), 403

        data = request.get_json()
        student_email = data.get("student_email")
        permissions = data.get("permissions", [
            "create_companies",
            "verify_experiences",
            "verify_profiles"
        ])

        if not student_email:
            return jsonify({"success": False, "message": "Student email required"}), 400

        db = current_app.config["MONGO_DB"]

        # Find student
        student = db.students.find_one({"email": student_email})
        if not student:
            return jsonify({"success": False, "message": "Student not found"}), 404

        # Check if already a sub admin
        existing_sub_admin = db.admins.find_one(
            {"email": student_email, "role": "sub_admin"})
        if existing_sub_admin:
            return jsonify({"success": False, "message": "Student is already a sub admin"}), 409

        # Create sub admin in admins collection
        sub_admin_data = {
            "adminId": f"SUB_ADMIN_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "email": student_email,
            "name": student["name"],
            "password": student["password"],
            "studentId": student["studentId"],
            "role": "sub_admin",
            "department": student.get("branch", ""),
            "permissions": permissions,
            "is_active": True,
            "createdBy": current_user,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }

        db.admins.insert_one(sub_admin_data)

        # Update student record to mark as sub admin
        db.students.update_one(
            {"email": student_email},
            {
                "$set": {
                    "is_sub_admin": True,
                    "updatedAt": datetime.utcnow()
                }
            }
        )

        return jsonify({
            "success": True,
            "message": f"Student {student['name']} promoted to sub admin successfully"
        }), 200

    except Exception as e:
        current_app.logger.error(f"Create sub admin error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


@admin_bp.route("/super-admin/sub-admins/<student_email>", methods=["DELETE"])
@jwt_required()
def remove_sub_admin(student_email):
    """Remove sub admin role from student"""
    try:
        current_user = get_jwt_identity()

        if not is_super_admin(current_user):
            return jsonify({"success": False, "message": "Super admin access required"}), 403

        db = current_app.config["MONGO_DB"]

        # Remove from admins collection
        result = db.admins.delete_one(
            {"email": student_email, "role": "sub_admin"})

        if result.deleted_count == 0:
            return jsonify({"success": False, "message": "Sub admin not found"}), 404

        # Update student record
        db.students.update_one(
            {"email": student_email},
            {
                "$set": {
                    "is_sub_admin": False,
                    "updatedAt": datetime.utcnow()
                }
            }
        )

        return jsonify({
            "success": True,
            "message": "Sub admin removed successfully"
        }), 200

    except Exception as e:
        current_app.logger.error(f"Remove sub admin error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


@admin_bp.route("/super-admin/students", methods=["GET"])
@jwt_required()
def get_all_students():
    """Get all students for super admin"""
    try:
        current_user = get_jwt_identity()

        if not is_super_admin(current_user):
            return jsonify({"success": False, "message": "Super admin access required"}), 403

        db = current_app.config["MONGO_DB"]

        # Query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        department = request.args.get('department', '')
        search = request.args.get('search', '')

        skip = (page - 1) * limit

        # Build query
        query = {}
        if department:
            query["branch"] = department
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"studentId": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]

        # Get students
        students_cursor = db.students.find(query).sort(
            "createdAt", -1).skip(skip).limit(limit)
        total_students = db.students.count_documents(query)

        students = []
        for student in students_cursor:
            # Safely get student ID - handle both studentId and student_id fields
            student_id = student.get(
                "studentId") or student.get("student_id", "")

            students.append({
                "student_id": student_id,
                "name": student.get("name", ""),
                "email": student.get("email", ""),
                "department": student.get("branch", ""),
                "semester": student.get("semester", 0),
                "cgpa": student.get("cgpa", 0.0),
                "is_setup_complete": student.get("is_setup_complete", False),
                "is_sub_admin": student.get("is_sub_admin", False),
                "created_at": student.get("createdAt").isoformat() if student.get("createdAt") else None
            })

        # Get department list for filters
        departments = db.students.distinct("branch", {"branch": {"$ne": ""}})

        return jsonify({
            "success": True,
            "students": students,
            "departments": departments,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_students,
                "pages": (total_students + limit - 1) // limit
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get students error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

@admin_bp.route("/super-admin/sub-admins", methods=["GET"])
@jwt_required()
def get_all_sub_admins():
    """Get all current sub admins"""
    try:
        current_user = get_jwt_identity()

        if not is_super_admin(current_user):
            return jsonify({"success": False, "message": "Super admin access required"}), 403

        db = current_app.config["MONGO_DB"]

        sub_admins_cursor = db.admins.find(
            {"role": "sub_admin"}).sort("createdAt", -1)

        sub_admins = []
        for admin in sub_admins_cursor:
            sub_admins.append({
                "student_id": admin["studentId"],
                "name": admin["name"],
                "email": admin["email"],
                "department": admin.get("department", ""),
                "permissions": admin.get("permissions", []),
                "since": admin.get("createdAt").isoformat() if admin.get("createdAt") else None,
                "created_by": admin.get("createdBy")
            })

        return jsonify({
            "success": True,
            "sub_admins": sub_admins
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get sub admins error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

# ========================= SUB ADMIN ROUTES =========================


@admin_bp.route("/sub-admin/companies", methods=["POST"])
@jwt_required()
def create_company():
    """Sub admin creates company profile"""
    try:
        current_user = get_jwt_identity()

        if not is_sub_admin(current_user):
            return jsonify({"success": False, "message": "Sub admin access required"}), 403

        data = request.get_json()
        print(data)

        # Validate required fields
        required_fields = ["name", "description", "location", "website"]
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "message": f"Missing required field: {field}"}), 400

        db = current_app.config["MONGO_DB"]

        # Generate company ID
        company_id = str(uuid.uuid4())

        # Create company document
        company_data = {
            "companyId": company_id,
            "name": data["name"],
            "logo": data.get("logo", ""),
            "description": data["description"],
            "location": data["location"],
            "website": data["website"],
            "founded": data.get("founded", ""),
            "employees": data.get("employees", ""),
            "tags": data.get("tags", []),

            # Job roles information
            "jobRoles": data.get("jobRoles", []),

            # Stats (initial values)
            "rating": 0.0,
            "experienceCount": 0,
            "stats": {
                "successRate": 0,
                "totalHired": 0,
                "avgPackage": 0,
                "difficulty": "Medium",
                "highestPackage": 0,
                "thisYearHires": 0
            },

            # Verification status
            "is_verified": False,  # Needs super admin verification
            "verified_by": None,
            "verified_at": None,

            # Created by sub admin
            "created_by": current_user,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        db.companies.insert_one(company_data)

        return jsonify({
            "success": True,
            "message": "Company profile created successfully. Waiting for super admin verification.",
            "companyId": company_id
        }), 201

    except Exception as e:
        current_app.logger.error(f"Create company error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


@admin_bp.route("/sub-admin/experiences/pending", methods=["GET"])
@jwt_required()
def get_pending_experiences():
    """Get experiences pending verification"""
    try:
        current_user = get_jwt_identity()

        if not is_sub_admin(current_user):
            return jsonify({"success": False, "message": "Sub admin access required"}), 403

        db = current_app.config["MONGO_DB"]

        # Get experiences pending verification
        experiences_cursor = db.experiences.find(
            {"isVerified": False}).sort("createdAt", -1)

        experiences = []
        for exp in experiences_cursor:
            # Extract rounds data for display
            rounds_data = exp.get("roundsData", {})
            selected_rounds = exp.get("selectedRounds", [])

            experiences.append({
                "experience_id": str(exp["_id"]),
                "experienceId": exp.get("experienceId", ""),
                "company_name": exp.get("companyName", ""),
                "user_id": exp.get("userId", ""),
                "job_role": exp.get("jobRole", ""),
                "status": exp.get("status", ""),
                "selected_rounds": selected_rounds,
                "rounds_data": rounds_data,
                "overall_rating": exp.get("overallRating", 0),
                "experience_summary": exp.get("experienceSummary", ""),
                "created_at": exp.get("createdAt"),
                "updated_at": exp.get("updatedAt"),
                "likes": exp.get("likes", 0),
                "views": exp.get("views", 0)
            })

        return jsonify({
            "success": True,
            "experiences": experiences
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get pending experiences error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


@admin_bp.route("/sub-admin/experiences/<experience_id>/verify", methods=["POST"])
@jwt_required()
def verify_experience(experience_id):
    """Verify an interview experience"""
    try:
        current_user = get_jwt_identity()

        if not is_sub_admin(current_user):
            return jsonify({"success": False, "message": "Sub admin access required"}), 403

        db = current_app.config["MONGO_DB"]

        # Verify the experience exists
        experience = db.experiences.find_one({"_id": ObjectId(experience_id)})
        if not experience:
            return jsonify({"success": False, "message": "Experience not found"}), 404

        # Verify the experience
        result = db.experiences.update_one(
            {"_id": ObjectId(experience_id)},
            {
                "$set": {
                    "isVerified": True,
                    "verified_by": current_user,
                    "verified_at": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
            }
        )

        if result.modified_count == 0:
            return jsonify({"success": False, "message": "Experience verification failed"}), 400

        return jsonify({
            "success": True,
            "message": "Experience verified successfully"
        }), 200

    except Exception as e:
        current_app.logger.error(f"Verify experience error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


@admin_bp.route("/sub-admin/experiences/<experience_id>/reject", methods=["POST"])
@jwt_required()
def reject_experience(experience_id):
    """Reject an interview experience"""
    try:
        current_user = get_jwt_identity()

        if not is_sub_admin(current_user):
            return jsonify({"success": False, "message": "Sub admin access required"}), 403

        db = current_app.config["MONGO_DB"]
        data = request.get_json()
        rejection_reason = data.get("rejection_reason", "")

        # Reject the experience
        result = db.experiences.update_one(
            {"_id": ObjectId(experience_id)},
            {
                "$set": {
                    "status": "Rejected",
                    "rejected_by": current_user,
                    "rejected_at": datetime.utcnow(),
                    "rejection_reason": rejection_reason,
                    "updatedAt": datetime.utcnow()
                }
            }
        )

        if result.modified_count == 0:
            return jsonify({"success": False, "message": "Experience not found"}), 404

        return jsonify({
            "success": True,
            "message": "Experience rejected successfully"
        }), 200

    except Exception as e:
        current_app.logger.error(f"Reject experience error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500
    
    
@admin_bp.route("/sub-admin/dashboard/stats", methods=["GET"])
@jwt_required()
def get_subadmin_dashboard_stats():
    """Get dashboard statistics for sub admin"""
    try:
        current_user = get_jwt_identity()

        if not is_sub_admin(current_user):
            return jsonify({"success": False, "message": "Sub admin access required"}), 403

        db = current_app.config["MONGO_DB"]

        # Get counts from database
        pending_experiences_count = db.experiences.count_documents({
            "isVerified": False
        })

        # Count experiences verified by this sub admin
        experiences_verified_count = db.experiences.count_documents({
            "verified_by": current_user,
            "isVerified": True
        })

        # Count companies created by this sub admin
        companies_created_count = db.companies.count_documents({
            "created_by": current_user
        })

        # Count pending student profiles (assuming you have a users collection with verification status)
        pending_profiles_count = db.users.count_documents({
            "is_verified": False,
            "role": "student"
        })

        return jsonify({
            "success": True,
            "stats": {
                "pending_experiences": pending_experiences_count,
                "pending_profiles": pending_profiles_count,
                "companies_created": companies_created_count,
                "experiences_verified": experiences_verified_count
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get dashboard stats error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


@admin_bp.route("/sub-admin/dashboard/recent-activity", methods=["GET"])
@jwt_required()
def get_subadmin_recent_activity():
    """Get recent activity for sub admin"""
    try:
        current_user = get_jwt_identity()

        if not is_sub_admin(current_user):
            return jsonify({"success": False, "message": "Sub admin access required"}), 403

        db = current_app.config["MONGO_DB"]

        # Get recent verified experiences by this sub admin
        recent_verified = db.experiences.find({
            "verified_by": current_user,
            "isVerified": True
        }).sort("verified_at", -1).limit(5)

        # Get recently created companies by this sub admin
        recent_companies = db.companies.find({
            "created_by": current_user
        }).sort("created_at", -1).limit(5)

        activities = []

        # Add experience verification activities
        for exp in recent_verified:
            activities.append({
                "type": "experience_verified",
                "message": f"Verified interview experience for {exp.get('companyName', 'Unknown Company')}",
                "time": exp.get('verified_at'),
                "icon": "CheckCircle",
                "color": "text-green-600",
                "timestamp": exp.get('verified_at')
            })

        # Add company creation activities
        for company in recent_companies:
            activities.append({
                "type": "company_created",
                "message": f"Created company profile for {company.get('name', 'Unknown Company')}",
                "time": company.get('created_at'),
                "icon": "Building2",
                "color": "text-blue-600",
                "timestamp": company.get('created_at')
            })

        # Add profile verification activities (if you have user verification)
        recent_profile_verifications = db.users.find({
            "verified_by": current_user,
            "is_verified": True
        }).sort("verified_at", -1).limit(3)

        for user in recent_profile_verifications:
            activities.append({
                "type": "profile_verified",
                "message": f"Approved profile for {user.get('student_id', 'Unknown Student')}",
                "time": user.get('verified_at'),
                "icon": "Users",
                "color": "text-purple-600",
                "timestamp": user.get('verified_at')
            })

        # Sort activities by timestamp (most recent first) and limit to 5
        activities.sort(key=lambda x: x.get(
            'timestamp', datetime.min), reverse=True)
        activities = activities[:5]

        # Format time for display
        for activity in activities:
            if activity.get('timestamp'):
                activity['time'] = format_relative_time(activity['timestamp'])

        return jsonify({
            "success": True,
            "recent_activity": activities
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get recent activity error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


@admin_bp.route("/sub-admin/dashboard/pending-experiences", methods=["GET"])
@jwt_required()
def get_pending_experiences_preview():
    """Get preview of pending experiences for dashboard"""
    try:
        current_user = get_jwt_identity()

        if not is_sub_admin(current_user):
            return jsonify({"success": False, "message": "Sub admin access required"}), 403

        db = current_app.config["MONGO_DB"]

        # Get pending experiences with limited fields for preview
        pending_experiences = db.experiences.find(
            {"isVerified": False}
        ).sort("createdAt", -1).limit(3)

        experiences_preview = []
        for exp in pending_experiences:
            experiences_preview.append({
                "experience_id": str(exp["_id"]),
                "company_name": exp.get("companyName", ""),
                "job_role": exp.get("jobRole", ""),
                "user_id": exp.get("userId", ""),
                "created_at": exp.get("createdAt")
            })

        return jsonify({
            "success": True,
            "pending_experiences": experiences_preview
        }), 200

    except Exception as e:
        current_app.logger.error(
            f"Get pending experiences preview error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


# Helper function to format relative time
def format_relative_time(timestamp):
    """Convert timestamp to relative time string"""
    if not timestamp:
        return "Recently"

    now = datetime.utcnow()
    diff = now - timestamp

    if diff.days > 0:
        if diff.days == 1:
            return "1 day ago"
        return f"{diff.days} days ago"
    elif diff.seconds >= 3600:
        hours = diff.seconds // 3600
        if hours == 1:
            return "1 hour ago"
        return f"{hours} hours ago"
    elif diff.seconds >= 60:
        minutes = diff.seconds // 60
        if minutes == 1:
            return "1 minute ago"
        return f"{minutes} minutes ago"
    else:
        return "Just now"

# Initialize super admin


@admin_bp.before_app_request
def initialize_super_admin():
    create_initial_super_admin()
