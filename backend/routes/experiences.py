from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from datetime import datetime
import uuid

experiences_bp = Blueprint("experiences", __name__)

# ========================= SUBMIT EXPERIENCE =========================


@experiences_bp.route("/experiences", methods=["POST"])
@jwt_required()
def submit_experience():
    try:
        db = current_app.config["MONGO_DB"]
        current_user = get_jwt_identity()

        data = request.get_json()

        # Validate required fields
        required_fields = ["companyId", "companyName",
                           "jobRole", "status", "selectedRounds"]
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "message": f"Missing required field: {field}"}), 400

        # Create comprehensive experience document
        experience_id = str(uuid.uuid4())
        experience_data = {
            # Basic Information
            "experienceId": experience_id,
            "userId": current_user,
            "companyId": data["companyId"],
            "companyName": data["companyName"],
            "jobRole": data["jobRole"],
            "status": data["status"],

            # Rounds Information
            "selectedRounds": data["selectedRounds"],
            "roundsData": data.get("roundsData", {}),

            # Overall Experience
            "overallRating": data.get("overallRating", 0),
            "experienceSummary": data.get("experienceSummary", ""),

            # Timestamps
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),

            # Metadata
            "isVerified": False,
            "likes": 0,
            "comments": [],
            "views": 0,

            # Additional structured data for analytics
            "analytics": {
                "totalRounds": len(data["selectedRounds"]),
                "hasCodingRound": "coding" in data["selectedRounds"],
                "hasTechnicalRound": "technical" in data["selectedRounds"],
                "hasHRRound": "hr" in data["selectedRounds"],
                "hasAptitudeRound": "aptitude" in data["selectedRounds"],
                "hasGroupDiscussion": "group discussion" in data["selectedRounds"]
            }
        }

        # Insert into database
        result = db.experiences.insert_one(experience_data)

        # Update company experience count and analytics
        update_company_analytics(
            db, data["companyId"], data["selectedRounds"], data.get("roundsData", {}))

        return jsonify({
            "success": True,
            "message": "Experience submitted successfully",
            "experienceId": experience_id
        }), 201

    except Exception as e:
        current_app.logger.error(f"Submit experience error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


def update_company_analytics(db, company_id, selected_rounds, rounds_data):
    """Update company analytics based on the submitted experience"""
    try:
        # Update experience count
        db.companies.update_one(
            {"$or": [
                {"companyId": company_id},
                {"_id": ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]},
            {"$inc": {"experienceCount": 1}}
        )

        # Update rounds analytics
        for round_name in selected_rounds:
            round_key = f"roundsAnalytics.{round_name.lower().replace(' ', '')}.count"
            db.companies.update_one(
                {"$or": [
                    {"companyId": company_id},
                    {"_id": ObjectId(company_id) if ObjectId.is_valid(
                        company_id) else None}
                ]},
                {"$inc": {round_key: 1}}
            )

            # Update difficulty statistics if available
            if round_name in rounds_data:
                round_data = rounds_data[round_name]
                if "difficulty" in round_data:
                    difficulty_key = f"roundsAnalytics.{round_name.lower().replace(' ', '')}.difficulty.{round_data['difficulty'].lower()}"
                    db.companies.update_one(
                        {"$or": [
                            {"companyId": company_id},
                            {"_id": ObjectId(company_id) if ObjectId.is_valid(
                                company_id) else None}
                        ]},
                        {"$inc": {difficulty_key: 1}}
                    )

    except Exception as e:
        current_app.logger.error(f"Update company analytics error: {str(e)}")

# ========================= GET USER EXPERIENCES =========================


@experiences_bp.route("/experiences", methods=["GET"])
@jwt_required()
def get_user_experiences():
    try:
        db = current_app.config["MONGO_DB"]
        current_user = get_jwt_identity()

        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        skip = (page - 1) * limit

        # Get user's experiences
        experiences_cursor = db.experiences.find(
            {"userId": current_user}
        ).sort("createdAt", -1).skip(skip).limit(limit)

        total_experiences = db.experiences.count_documents(
            {"userId": current_user})

        experiences = []
        for exp in experiences_cursor:
            experiences.append({
                "experienceId": exp.get("experienceId"),
                "companyId": exp.get("companyId"),
                "companyName": exp.get("companyName"),
                "jobRole": exp.get("jobRole"),
                "status": exp.get("status"),
                "selectedRounds": exp.get("selectedRounds", []),
                "overallRating": exp.get("overallRating", 0),
                "createdAt": exp.get("createdAt").isoformat() if exp.get("createdAt") else None,
                "isVerified": exp.get("isVerified", False),
                "likes": exp.get("likes", 0),
                "analytics": exp.get("analytics", {})
            })

        return jsonify({
            "success": True,
            "experiences": experiences,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_experiences,
                "pages": (total_experiences + limit - 1) // limit
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get user experiences error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

# ========================= GET EXPERIENCE BY ID =========================


@experiences_bp.route("/experiences/<experience_id>", methods=["GET"])
def get_experience_by_id(experience_id):
    try:
        db = current_app.config["MONGO_DB"]

        experience = db.experiences.find_one({"experienceId": experience_id})

        if not experience:
            return jsonify({"success": False, "message": "Experience not found"}), 404

        # Format response (exclude sensitive user data)
        experience_data = {
            "experienceId": experience.get("experienceId"),
            "companyId": experience.get("companyId"),
            "companyName": experience.get("companyName"),
            "jobRole": experience.get("jobRole"),
            "status": experience.get("status"),
            "selectedRounds": experience.get("selectedRounds", []),
            "roundsData": experience.get("roundsData", {}),
            "overallRating": experience.get("overallRating", 0),
            "experienceSummary": experience.get("experienceSummary", ""),
            "createdAt": experience.get("createdAt").isoformat() if experience.get("createdAt") else None,
            "isVerified": experience.get("isVerified", False),
            "likes": experience.get("likes", 0),
            "analytics": experience.get("analytics", {})
        }

        return jsonify({
            "success": True,
            "experience": experience_data
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get experience error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

# ========================= GET COMPANY EXPERIENCES =========================


@experiences_bp.route("/companies/<company_id>/experiences", methods=["GET"])
def get_company_experiences(company_id):
    try:
        db = current_app.config["MONGO_DB"]

        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        skip = (page - 1) * limit

        # Build query
        query = {
            "$or": [
                {"companyId": company_id},
                {"_id": ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]
        }

        experiences_cursor = db.experiences.find(query).sort(
            "createdAt", -1).skip(skip).limit(limit)
        total_experiences = db.experiences.count_documents(query)

        experiences = []
        for exp in experiences_cursor:
            # Don't include user-sensitive information
            experiences.append({
                "experienceId": exp.get("experienceId"),
                "jobRole": exp.get("jobRole"),
                "status": exp.get("status"),
                "selectedRounds": exp.get("selectedRounds", []),
                "overallRating": exp.get("overallRating", 0),
                "experienceSummary": exp.get("experienceSummary", ""),
                "createdAt": exp.get("createdAt").isoformat() if exp.get("createdAt") else None,
                "isVerified": exp.get("isVerified", False),
                "likes": exp.get("likes", 0),
                "analytics": exp.get("analytics", {})
            })

        return jsonify({
            "success": True,
            "experiences": experiences,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_experiences,
                "pages": (total_experiences + limit - 1) // limit
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get company experiences error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

# ========================= GET ROUND STATISTICS =========================


@experiences_bp.route("/companies/<company_id>/round-stats", methods=["GET"])
def get_round_statistics(company_id):
    try:
        db = current_app.config["MONGO_DB"]

        # Aggregate round statistics
        pipeline = [
            {
                "$match": {
                    "$or": [
                        {"companyId": company_id},
                        {"_id": ObjectId(company_id) if ObjectId.is_valid(
                            company_id) else None}
                    ]
                }
            },
            {
                "$unwind": "$selectedRounds"
            },
            {
                "$group": {
                    "_id": "$selectedRounds",
                    "count": {"$sum": 1},
                    "avgRating": {"$avg": "$overallRating"}
                }
            }
        ]

        round_stats = list(db.experiences.aggregate(pipeline))

        return jsonify({
            "success": True,
            "roundStats": round_stats
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get round statistics error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500






