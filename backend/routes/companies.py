# companies.py or add to auth.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from bson.objectid import ObjectId

companies_bp = Blueprint("companies", __name__)

# ========================= GET ALL COMPANIES =========================


# ========================= GET ALL COMPANIES =========================
@companies_bp.route("/companies", methods=["GET"])
def get_all_companies():
    try:
        db = current_app.config["MONGO_DB"]

        # Get query parameters for filtering/pagination
        page = int(request.args.get('page', 1))
        # Increased limit for dashboard
        limit = int(request.args.get('limit', 20))
        search = request.args.get('search', '')

        skip = (page - 1) * limit

        # Build query for search
        query = {}
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'tags': {'$in': [search]}},
                {'location': {'$regex': search, '$options': 'i'}}
            ]

        # Get companies with pagination
        companies_cursor = db.companies.find(query).skip(skip).limit(limit)
        total_companies = db.companies.count_documents(query)

        companies = []
        for company in companies_cursor:
            # Use companyId if available, otherwise use _id
            company_id = company.get("companyId") or str(company.get("_id"))

            companies.append({
                "id": company_id,  # Use companyId for frontend navigation
                "companyId": company.get("companyId"),
                "name": company.get("name"),
                "logo": company.get("logo"),
                "description": company.get("description"),
                "location": company.get("location"),
                "rating": company.get("rating"),
                "experienceCount": company.get("experienceCount"),
                "tags": company.get("tags", []),
                "stats": company.get("stats", {}),
                "jobRoles": company.get("jobRoles", [])
            })

        return jsonify({
            "success": True,
            "companies": companies,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_companies,
                "pages": (total_companies + limit - 1) // limit
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get companies error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

# ========================= GET COMPANY BY ID =========================


@companies_bp.route("/companies/<company_id>", methods=["GET"])
def get_company_by_id(company_id):
    try:
        db = current_app.config["MONGO_DB"]

        # Try to find by companyId first, then by _id
        company = db.companies.find_one({
            '$or': [
                {'companyId': company_id},
                {'_id': ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]
        })

        if not company:
            return jsonify({"success": False, "message": "Company not found"}), 404

        # Format the response
        company_data = {
            "id": str(company.get("_id")),
            "companyId": company.get("companyId"),
            "name": company.get("name"),
            "logo": company.get("logo"),
            "description": company.get("description"),
            "location": company.get("location"),
            "founded": company.get("founded"),
            "employees": company.get("employees"),
            "website": company.get("website"),
            "rating": company.get("rating"),
            "experienceCount": company.get("experienceCount"),
            "tags": company.get("tags", []),
            "stats": company.get("stats", {}),
            "jobRoles": company.get("jobRoles", []),
            "roundsAnalytics": company.get("roundsAnalytics", {}),
            "insights": company.get("insights", {}),
            "placedStudents": company.get("placedStudents", [])
        }

        return jsonify({
            "success": True,
            "company": company_data
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get company error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

# ========================= GET COMPANY OVERVIEW =========================


@companies_bp.route("/companies/<company_id>/overview", methods=["GET"])
def get_company_overview(company_id):
    try:
        db = current_app.config["MONGO_DB"]

        company = db.companies.find_one({
            '$or': [
                {'companyId': company_id},
                {'_id': ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]
        })

        if not company:
            return jsonify({"success": False, "message": "Company not found"}), 404

        overview_data = {
            "stats": company.get("stats", {}),
            "jobRoles": company.get("jobRoles", [])
        }

        return jsonify({
            "success": True,
            "overview": overview_data
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get company overview error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

# ========================= GET COMPANY ROUNDS ANALYTICS =========================


@companies_bp.route("/companies/<company_id>/rounds", methods=["GET"])
def get_company_rounds(company_id):
    try:
        db = current_app.config["MONGO_DB"]

        company = db.companies.find_one({
            '$or': [
                {'companyId': company_id},
                {'_id': ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]
        })

        if not company:
            return jsonify({"success": False, "message": "Company not found"}), 404

        rounds_data = company.get("roundsAnalytics", {})

        return jsonify({
            "success": True,
            "rounds": rounds_data
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get company rounds error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

# ========================= GET COMPANY INSIGHTS =========================


# @companies_bp.route("/companies/<company_id>/insights", methods=["GET"])
# def get_company_insights(company_id):
#     try:
#         db = current_app.config["MONGO_DB"]

#         company = db.companies.find_one({
#             '$or': [
#                 {'companyId': company_id},
#                 {'_id': ObjectId(company_id) if ObjectId.is_valid(
#                     company_id) else None}
#             ]
#         })

#         if not company:
#             return jsonify({"success": False, "message": "Company not found"}), 404

#         insights_data = company.get("insights", {})

#         return jsonify({
#             "success": True,
#             "insights": insights_data
#         }), 200

#     except Exception as e:
#         current_app.logger.error(f"Get company insights error: {str(e)}")
#         return jsonify({"success": False, "message": "Internal server error"}), 500

# ========================= GET PLACED STUDENTS =========================


@companies_bp.route("/companies/<company_id>/placed-students", methods=["GET"])
def get_placed_students(company_id):
    try:
        db = current_app.config["MONGO_DB"]

        company = db.companies.find_one({
            '$or': [
                {'companyId': company_id},
                {'_id': ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]
        })

        if not company:
            return jsonify({"success": False, "message": "Company not found"}), 404

        placed_students = company.get("placedStudents", [])
        stats = company.get("stats", {})

        return jsonify({
            "success": True,
            "placedStudents": placed_students,
            "stats": {
                "totalPlaced": stats.get("totalHired", 0),
                "highestPackage": stats.get("highestPackage", 0),
                "thisYear": stats.get("thisYearHires", 0)
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get placed students error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


# ========================= GET COMPANY JOB ROLES =========================
@companies_bp.route("/companies/<company_id>/job-roles", methods=["GET"])
def get_company_job_roles(company_id):
    try:
        db = current_app.config["MONGO_DB"]

        # Find company
        company = db.companies.find_one({
            '$or': [
                {'companyId': company_id},
                {'_id': ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]
        })

        if not company:
            return jsonify({"success": False, "message": "Company not found"}), 404

        # Get job roles from company data
        job_roles = company.get("jobRoles", [])

        # If no job roles in company data, get from experiences
        if not job_roles:
            experiences = db.experiences.find({
                "$or": [
                    {"companyId": company_id},
                    {"_id": ObjectId(company_id) if ObjectId.is_valid(
                        company_id) else None}
                ]
            })

            # Extract unique job roles from experiences
            job_roles_set = set()
            for exp in experiences:
                if exp.get("jobRole"):
                    job_roles_set.add(exp.get("jobRole"))

            job_roles = list(job_roles_set)

        return jsonify({
            "success": True,
            "jobRoles": job_roles
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get company job roles error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500
