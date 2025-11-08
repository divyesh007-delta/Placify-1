from datetime import datetime
import io
import base64
import matplotlib.pyplot as plt
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from bson.objectid import ObjectId
from collections import Counter
import re
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import matplotlib
import seaborn as sns
from wordcloud import WordCloud
import base64
from io import BytesIO
matplotlib.use('Agg')  # Use non-interactive backend

analysis_bp = Blueprint("analysis", __name__)


def convert_numpy_types(obj):
    """
    Recursively convert numpy types to native Python types for JSON serialization
    """
    if isinstance(obj, (np.integer, np.int64, np.int32, np.int16, np.int8)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32, np.float16)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_numpy_types(item) for item in obj)
    elif isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    elif obj is None:
        return None
    elif pd.isna(obj):  # Handle pandas NaN
        return None
    else:
        return obj

# ========================= ANALYZE COMPANY EXPERIENCES =========================


@analysis_bp.route("/companies/<company_id>/analyze", methods=["GET"])
def analyze_company_experiences(company_id):
    try:
        db = current_app.config["MONGO_DB"]

        # Get experiences for the company
        query = {
            "$or": [
                {"companyId": company_id},
                {"_id": ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]
        }

        experiences_cursor = db.experiences.find(query)
        experiences = list(experiences_cursor)

        if not experiences:
            return jsonify({
                "success": False,
                "message": "No experiences found for analysis"
            }), 404

        # Get company info
        company = db.companies.find_one(query)
        company_name = company.get(
            "name", "Unknown Company") if company else "Unknown Company"

        # Analyze the experiences
        analysis_results = analyze_experiences_data(
            experiences, company_name, company_id)

        return jsonify({
            "success": True,
            "analysis": convert_numpy_types(analysis_results),
            "companyName": company_name,
            "totalExperiences": len(experiences)
        }), 200

    except Exception as e:
        current_app.logger.error(
            f"Analyze company experiences error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


def analyze_experiences_data(experiences, company_name, company_id):
    """Analyze experiences data and generate insights"""

    # Convert to DataFrame for analysis
    df_data = []
    for exp in experiences:
        row = {
            "experienceId": exp.get("experienceId"),
            "companyName": exp.get("companyName", company_name),
            "jobRole": exp.get("jobRole", ""),
            "status": exp.get("status", "Pending"),
            "overallRating": exp.get("overallRating", 0),
            "selectedRounds": exp.get("selectedRounds", []),
            "roundsData": exp.get("roundsData", {}),
            "experienceSummary": exp.get("experienceSummary", ""),
            "createdAt": exp.get("createdAt")
        }
        df_data.append(row)

    df = pd.DataFrame(df_data)

    # Generate insights
    insights = {
        "companyName": company_name,
        "analysisDate": datetime.utcnow().isoformat(),
        "overallStats": generate_overall_stats(df),
        "roundsAnalysis": generate_rounds_analysis(df),
        "difficultyAnalysis": generate_difficulty_analysis(df),
        "topQuestions": generate_top_questions(df),
        "successPatterns": generate_success_patterns(df),
        "preparationTips": generate_preparation_tips(df),
        "charts": generate_charts(df, company_name)
    }

    return convert_numpy_types(insights)


def generate_overall_stats(df):
    """Generate overall statistics"""
    total_experiences = len(df)
    selected_count = len(df[df["status"] == "Selected"])
    rejected_count = len(df[df["status"] == "Rejected"])
    pending_count = len(df[df["status"] == "Pending"])

    success_rate = (selected_count / total_experiences) * \
        100 if total_experiences > 0 else 0
    # Convert to float explicitly
    avg_rating = float(df["overallRating"].mean())

    # Job role distribution - convert numpy types
    job_roles = df["jobRole"].value_counts().head(5).to_dict()
    job_roles = {str(k): int(v) for k, v in job_roles.items()
                 }  # Ensure string keys and int values

    return {
        "totalExperiences": int(total_experiences),
        "successRate": float(round(success_rate, 1)),
        "selectedCount": int(selected_count),
        "rejectedCount": int(rejected_count),
        "pendingCount": int(pending_count),
        "averageRating": float(round(avg_rating, 1)),
        "topJobRoles": job_roles
    }


def generate_rounds_analysis(df):
    """Analyze rounds data"""
    rounds_counter = Counter()
    for rounds in df["selectedRounds"]:
        rounds_counter.update(rounds)

    rounds_analysis = {}
    for round_name, count in rounds_counter.most_common():
        round_data = {
            "frequency": int(count),
            "percentage": float(round((count / len(df)) * 100, 1)),
            "difficulty": analyze_round_difficulty(df, round_name),
            "commonTopics": analyze_round_topics(df, round_name)
        }
        rounds_analysis[round_name] = round_data

    return rounds_analysis


def analyze_round_difficulty(df, round_name):
    """Analyze difficulty for a specific round"""
    difficulties = []
    for _, exp in df.iterrows():
        round_data = exp["roundsData"].get(round_name, {})
        if "difficulty" in round_data:
            difficulties.append(round_data["difficulty"])

    if not difficulties:
        return "Unknown"

    difficulty_counter = Counter(difficulties)
    return difficulty_counter.most_common(1)[0][0]


def analyze_round_topics(df, round_name):
    """Extract common topics for a round"""
    all_topics = []
    for _, exp in df.iterrows():
        round_data = exp["roundsData"].get(round_name, {})

        # Extract topics based on round type
        if round_name == "technical" and "focusTopics" in round_data:
            all_topics.extend(round_data["focusTopics"])
        elif round_name == "coding" and "languagesUsed" in round_data:
            all_topics.extend(round_data["languagesUsed"])

    topic_counter = Counter(all_topics)
    return [{"topic": str(topic), "frequency": int(count)} for topic, count in topic_counter.most_common(5)]


def generate_difficulty_analysis(df):
    """Analyze difficulty patterns"""
    difficulty_scores = {"Easy": 1, "Medium": 2, "Hard": 3}
    round_difficulties = {}

    for _, exp in df.iterrows():
        for round_name, round_data in exp["roundsData"].items():
            if "difficulty" in round_data:
                difficulty = round_data["difficulty"]
                if round_name not in round_difficulties:
                    round_difficulties[round_name] = []
                round_difficulties[round_name].append(
                    difficulty_scores.get(difficulty, 2))

    avg_difficulties = {}
    for round_name, scores in round_difficulties.items():
        # Convert to float
        avg_score = float(np.mean(scores)) if scores else 0.0
        avg_difficulties[round_name] = {
            "averageDifficulty": float(round(avg_score, 1)),
            "difficultyLevel": get_difficulty_level(avg_score)
        }

    return avg_difficulties


def get_difficulty_level(score):
    """Convert numerical score to difficulty level"""
    if score < 1.5:
        return "Easy"
    elif score < 2.5:
        return "Medium"
    else:
        return "Hard"


def generate_top_questions(df):
    """Generate top questions from all rounds"""
    top_questions = {}

    # Analyze each round type
    round_types = ["aptitude", "coding", "technical", "hr"]

    for round_type in round_types:
        questions = extract_questions_from_round(df, round_type)
        if questions:
            top_clusters = cluster_questions(questions, round_type)
            top_questions[round_type] = top_clusters

    return top_questions


def extract_questions_from_round(df, round_type):
    """Extract questions from a specific round type"""
    questions = []

    for _, exp in df.iterrows():
        round_data = exp["roundsData"].get(round_type, {})

        if round_type == "aptitude" and "sampleQuestions" in round_data:
            for q in round_data["sampleQuestions"]:
                if "question" in q and q["question"]:
                    questions.append(q["question"])

        elif round_type == "coding" and "top3Questions" in round_data:
            for q in round_data["top3Questions"]:
                if "question" in q and q["question"]:
                    questions.append(q["question"])

        elif round_type == "technical" and "top5Questions" in round_data:
            for q in round_data["top5Questions"]:
                if "question" in q and q["question"]:
                    questions.append(q["question"])

        elif round_type == "hr" and "topQuestions" in round_data:
            for q in round_data["topQuestions"]:
                if "question" in q and q["question"]:
                    questions.append(q["question"])

    return questions


def cluster_questions(questions, round_type, top_n=5, threshold=0.65):
    """Cluster similar questions using NLP"""
    if not questions:
        return []

    # Clean questions
    cleaned_questions = [clean_text(q) for q in questions]

    # Remove duplicates
    unique_questions = list(set(questions))
    unique_cleaned = [clean_text(q) for q in unique_questions]

    if len(unique_questions) <= 1:
        return [{"question": str(questions[0]), "frequency": int(len(questions))}] if questions else []

    # Vectorize and cluster
    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        X = vectorizer.fit_transform(unique_cleaned)
        sim_matrix = cosine_similarity(X)

        clusters = []
        assigned = [False] * len(unique_questions)

        for i in range(len(unique_questions)):
            if assigned[i]:
                continue

            cluster_members = [i]
            assigned[i] = True

            for j in range(i + 1, len(unique_questions)):
                if not assigned[j] and sim_matrix[i, j] >= threshold:
                    cluster_members.append(j)
                    assigned[j] = True

            clusters.append(cluster_members)

        # Format cluster info
        cluster_info = []
        for cluster in clusters:
            cluster_questions = [unique_questions[idx] for idx in cluster]
            # Use longest as representative
            representative = max(cluster_questions, key=len)

            cluster_info.append({
                "representativeQuestion": str(representative),
                "frequency": int(len(cluster)),
                # Show top 3 similar
                "similarQuestions": [str(q) for q in cluster_questions[:3]]
            })

        # Sort by frequency and return top N
        cluster_info.sort(key=lambda x: x["frequency"], reverse=True)
        return cluster_info[:top_n]

    except Exception as e:
        # Fallback: return most frequent questions
        question_counter = Counter(questions)
        return [{"question": str(q), "frequency": int(count)} for q, count in question_counter.most_common(top_n)]


def clean_text(text):
    """Clean text for NLP processing"""
    text = str(text).lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def generate_success_patterns(df):
    """Identify patterns for successful candidates"""
    successful = df[df["status"] == "Selected"]
    unsuccessful = df[df["status"] == "Rejected"]

    if len(successful) == 0:
        return {"message": "Not enough successful cases for analysis"}

    patterns = {
        "successfulCandidates": int(len(successful)),
        "averageRatingSuccessful": float(round(successful["overallRating"].mean(), 1)),
        "averageRatingUnsuccessful": float(round(unsuccessful["overallRating"].mean(), 1)) if len(unsuccessful) > 0 else 0.0,
        "commonRoundsSuccessful": analyze_successful_rounds(successful),
        "keyDifferentiators": find_key_differentiators(successful, unsuccessful)
    }

    return patterns


def analyze_successful_rounds(successful_df):
    """Analyze rounds taken by successful candidates"""
    rounds_counter = Counter()
    for rounds in successful_df["selectedRounds"]:
        rounds_counter.update(rounds)

    return [{"round": round_name, "frequency": int(count)} for round_name, count in rounds_counter.most_common()]


def find_key_differentiators(successful_df, unsuccessful_df):
    """Find what differentiates successful candidates"""
    differentiators = []

    # Compare rounds completion
    successful_rounds_avg = float(
        successful_df["selectedRounds"].apply(len).mean())
    unsuccessful_rounds_avg = float(unsuccessful_df["selectedRounds"].apply(
        len).mean()) if len(unsuccessful_df) > 0 else 0.0

    if successful_rounds_avg > unsuccessful_rounds_avg:
        differentiators.append(
            f"Successful candidates complete more rounds on average ({successful_rounds_avg:.1f} vs {unsuccessful_rounds_avg:.1f})")

    # Compare ratings
    successful_rating = float(successful_df["overallRating"].mean())
    unsuccessful_rating = float(unsuccessful_df["overallRating"].mean()) if len(
        unsuccessful_df) > 0 else 0.0

    if successful_rating > unsuccessful_rating:
        differentiators.append("Higher overall interview experience rating")

    return differentiators


def generate_preparation_tips(df):
    """Generate preparation tips based on analysis"""
    tips = []

    # Analyze rounds frequency
    rounds_analysis = generate_rounds_analysis(df)
    most_common_rounds = sorted(rounds_analysis.items(
    ), key=lambda x: x[1]["frequency"], reverse=True)[:3]

    for round_name, data in most_common_rounds:
        if data["frequency"] > 0:
            difficulty = data["difficulty"]
            tips.append(
                f"Focus on {round_name} round - appears in {data['percentage']}% of interviews (Typically {difficulty} difficulty)")

    # Add tips based on top questions
    top_questions = generate_top_questions(df)
    for round_type, questions in top_questions.items():
        if questions:
            top_q = questions[0]["representativeQuestion"] if "representativeQuestion" in questions[0] else questions[0]["question"]
            tips.append(
                f"Prepare for '{top_q[:50]}...' - most common {round_type} question")

    # General tips
    if len(df) > 10:
        success_rate = (len(df[df["status"] == "Selected"]) / len(df)) * 100
        if success_rate < 30:
            tips.append(
                "Company has competitive selection process - thorough preparation recommended")
        elif success_rate > 60:
            tips.append(
                "Good success rate - focus on core concepts and communication skills")

    return tips


def generate_charts(df, company_name):
    """Generate chart data for frontend"""
    charts = {}

    # Status distribution chart
    status_counts = df["status"].value_counts()
    charts["statusDistribution"] = {
        "labels": [str(label) for label in status_counts.index],
        "data": [int(value) for value in status_counts.values],
        "colors": ["#10b981", "#ef4444", "#f59e0b"]  # green, red, yellow
    }

    # Rounds frequency chart
    rounds_counter = Counter()
    for rounds in df["selectedRounds"]:
        rounds_counter.update(rounds)

    charts["roundsFrequency"] = {
        "labels": [str(label) for label in rounds_counter.keys()],
        "data": [int(value) for value in rounds_counter.values()],
        "colors": ["#3b82f6", "#8b5cf6", "#06b6d4", "#84cc16", "#f59e0b"]
    }

    # Difficulty distribution
    difficulty_data = {}
    for _, exp in df.iterrows():
        for round_name, round_data in exp["roundsData"].items():
            if "difficulty" in round_data:
                if round_name not in difficulty_data:
                    difficulty_data[round_name] = Counter()
                difficulty_data[round_name][round_data["difficulty"]] += 1

    # Convert Counter objects to regular dicts
    difficulty_data_serializable = {}
    for round_name, counter in difficulty_data.items():
        difficulty_data_serializable[round_name] = {
            str(k): int(v) for k, v in counter.items()}

    charts["difficultyByRound"] = difficulty_data_serializable

    return charts

# ========================= GET COMPANY INSIGHTS =========================


@analysis_bp.route("/companies/<company_id>/insights", methods=["GET"])
def get_company_insights(company_id):
    """Get pre-generated insights for company page - Main insights endpoint"""
    try:
        db = current_app.config["MONGO_DB"]

        # Get company data
        company = db.companies.find_one({
            "$or": [
                {"companyId": company_id},
                {"_id": ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]
        })

        if not company:
            return jsonify({"success": False, "message": "Company not found"}), 404

        # Check if we should use cached insights or generate new ones
        experiences_cursor = db.experiences.find({
            "$or": [
                {"companyId": company_id},
                {"_id": ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]
        })
        experiences = list(experiences_cursor)

        if not experiences:
            return jsonify({
                "success": False,
                "message": "No interview experiences found for analysis"
            }), 404

        # Always generate fresh insights from experiences data for accuracy
        analysis_results = analyze_experiences_data(
            experiences,
            company.get("name", "Unknown Company"),
            company_id
        )

        # Update company with fresh insights
        db.companies.update_one(
            {"$or": [
                {"companyId": company_id},
                {"_id": ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]},
            {"$set": {
                # Ensure serializable before saving
                "insights": convert_numpy_types(analysis_results),
                "insightsUpdatedAt": datetime.utcnow(),
                "experienceCount": len(experiences),
                "stats": generate_company_stats(analysis_results, experiences)
            }}
        )

        return jsonify({
            "success": True,
            "insights": convert_numpy_types(analysis_results),
            "metadata": {
                "totalExperiences": len(experiences),
                "analysisDate": datetime.utcnow().isoformat(),
                "companyName": company.get("name", "Unknown Company")
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get company insights error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


def generate_company_stats(insights, experiences):
    """Generate company stats from insights for the company document"""
    overall_stats = insights.get("overallStats", {})

    return {
        "totalHired": int(overall_stats.get("selectedCount", 0)),
        "successRate": float(overall_stats.get("successRate", 0)),
        "averageRating": float(overall_stats.get("averageRating", 0)),
        "totalExperiences": int(len(experiences)),
        "highestPackage": float(calculate_highest_package(experiences)),
        "thisYearHires": int(calculate_recent_hires(experiences))
    }


def calculate_highest_package(experiences):
    """Calculate highest package from experiences"""
    highest = 0
    for exp in experiences:
        if exp.get("compensation"):
            try:
                comp = float(exp["compensation"])
                highest = max(highest, comp)
            except (ValueError, TypeError):
                continue
    return highest


def calculate_recent_hires(experiences):
    """Calculate hires from current year"""
    current_year = datetime.utcnow().year
    recent_hires = 0

    for exp in experiences:
        if (exp.get("status") == "Selected" and
            exp.get("createdAt") and
                exp["createdAt"].year == current_year):
            recent_hires += 1

    return recent_hires

# Add a new endpoint for quick insights without database update


@analysis_bp.route("/companies/<company_id>/insights/quick", methods=["GET"])
def get_quick_insights(company_id):
    """Get real-time insights without updating database"""
    try:
        db = current_app.config["MONGO_DB"]

        experiences_cursor = db.experiences.find({
            "$or": [
                {"companyId": company_id},
                {"_id": ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]
        })
        experiences = list(experiences_cursor)

        if not experiences:
            return jsonify({
                "success": False,
                "message": "No experiences found"
            }), 404

        company = db.companies.find_one({
            "$or": [
                {"companyId": company_id},
                {"_id": ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]
        })

        analysis_results = analyze_experiences_data(
            experiences,
            company.get(
                "name", "Unknown Company") if company else "Unknown Company",
            company_id
        )

        return jsonify({
            "success": True,
            "insights": convert_numpy_types(analysis_results),
            "realTime": True
        }), 200

    except Exception as e:
        current_app.logger.error(f"Quick insights error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

# ========================= TRIGGER ANALYSIS UPDATE =========================


@analysis_bp.route("/companies/<company_id>/update-insights", methods=["POST"])
def update_company_insights(company_id):
    """Force update of company insights"""
    try:
        db = current_app.config["MONGO_DB"]

        # Get experiences
        experiences_cursor = db.experiences.find({
            "$or": [
                {"companyId": company_id},
                {"_id": ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]
        })
        experiences = list(experiences_cursor)

        if not experiences:
            return jsonify({"success": False, "message": "No experiences found for analysis"}), 404

        # Get company info
        company = db.companies.find_one({
            "$or": [
                {"companyId": company_id},
                {"_id": ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]
        })

        if not company:
            return jsonify({"success": False, "message": "Company not found"}), 404

        # Generate new insights
        analysis_results = analyze_experiences_data(
            experiences, company["name"], company_id)

        # Update company
        db.companies.update_one(
            {"$or": [
                {"companyId": company_id},
                {"_id": ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]},
            {"$set": {
                "insights": convert_numpy_types(analysis_results),
                "insightsUpdatedAt": datetime.utcnow()
            }}
        )

        return jsonify({
            "success": True,
            "message": "Insights updated successfully",
            "insights": convert_numpy_types(analysis_results)
        }), 200

    except Exception as e:
        current_app.logger.error(f"Update company insights error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


# Add these imports at the top

# Add these functions to analysis.py


def generate_rounds_analytics_data(df, company_name):
    """Generate comprehensive rounds analytics with structured chart data"""
    try:
        # Get basic chart data
        basic_chart_data = generate_basic_chart_data(df, company_name)

        # Get comprehensive chart data
        comprehensive_data = generate_comprehensive_chart_data(
            df, company_name)

        # Merge both datasets
        chart_data = {**basic_chart_data, **comprehensive_data}

        # Prepare detailed rounds data for frontend
        rounds_analytics = {}
        for round_type in ["aptitude", "coding", "technical", "hr"]:
            try:
                round_data = generate_round_details(df, round_type)
                if round_data:
                    rounds_analytics[round_type] = round_data
            except Exception as e:
                current_app.logger.warning(
                    f"Error generating details for {round_type}: {str(e)}")

        return {
            "chartData": chart_data,
            "roundsAnalytics": rounds_analytics,
            "summary": generate_rounds_summary(df, company_name)
        }

    except Exception as e:
        current_app.logger.error(
            f"Error generating rounds analytics: {str(e)}")
        return {"chartData": {}, "roundsAnalytics": {}, "summary": {}}


def generate_basic_chart_data(df, company_name):
    """Generate basic chart data"""
    chart_data = {}

    # 1. Rounds Distribution Data for Pie Chart
    try:
        rounds_series = df["selectedRounds"].explode()
        rounds_series = rounds_series[rounds_series.notna() & (
            rounds_series != '')]
        rounds_distribution = rounds_series.value_counts()

        if not rounds_distribution.empty:
            chart_data["roundsDistribution"] = [
                {"name": str(round_name), "value": int(
                    count), "count": int(count)}
                for round_name, count in rounds_distribution.items()
            ]
    except Exception as e:
        current_app.logger.warning(
            f"Could not create rounds distribution data: {str(e)}")
        chart_data["roundsDistribution"] = []

    # 2. Success Rate by Round Type Data for Bar Chart
    round_success_data = []
    for round_type in ["aptitude", "coding", "technical", "hr"]:
        try:
            round_experiences = df[df["selectedRounds"].apply(
                lambda x: round_type in x if isinstance(x, list) else False
            )]
            if len(round_experiences) > 0:
                success_count = len(round_experiences[
                    round_experiences["status"] == "Selected"
                ])
                success_rate = (success_count / len(round_experiences)) * 100

                round_success_data.append({
                    "round": round_type.capitalize(),
                    "successRate": float(round(success_rate, 1)),
                    "totalExperiences": len(round_experiences),
                    "successCount": success_count
                })
        except Exception as e:
            current_app.logger.warning(
                f"Error processing {round_type} round: {str(e)}")
            round_success_data.append({
                "round": round_type.capitalize(),
                "successRate": 0,
                "totalExperiences": 0,
                "successCount": 0
            })

    chart_data["successRateByRound"] = round_success_data

    # 3. Difficulty Level by Round Data for Bar Chart
    difficulty_data = []
    for round_type in ["aptitude", "coding", "technical", "hr"]:
        try:
            difficulties = []
            for _, exp in df.iterrows():
                round_data = exp.get("roundsData", {})
                if isinstance(round_data, dict):
                    round_specific_data = round_data.get(round_type, {})
                    if isinstance(round_specific_data, dict) and "difficulty" in round_specific_data:
                        difficulty = round_specific_data["difficulty"]
                        difficulty_score = {
                            "Easy": 1, "Medium": 2, "Hard": 3}.get(difficulty, 2)
                        difficulties.append(difficulty_score)

            if difficulties:
                avg_difficulty = float(np.mean(difficulties))
                difficulty_level = get_difficulty_level(avg_difficulty)

                difficulty_data.append({
                    "round": round_type.capitalize(),
                    "difficultyScore": float(round(avg_difficulty, 2)),
                    "difficultyLevel": difficulty_level,
                    "dataCount": len(difficulties)
                })
            else:
                difficulty_data.append({
                    "round": round_type.capitalize(),
                    "difficultyScore": 0,
                    "difficultyLevel": "Unknown",
                    "dataCount": 0
                })
        except Exception as e:
            current_app.logger.warning(
                f"Error processing difficulty for {round_type}: {str(e)}")
            difficulty_data.append({
                "round": round_type.capitalize(),
                "difficultyScore": 0,
                "difficultyLevel": "Unknown",
                "dataCount": 0
            })

    chart_data["difficultyByRound"] = difficulty_data

    # 4. Timeline Data for Line Chart
    timeline_data = []
    try:
        if "createdAt" in df.columns and not df["createdAt"].isna().all():
            df_with_dates = df.dropna(subset=["createdAt"]).copy()
            if not df_with_dates.empty:
                # Handle MongoDB date format
                df_with_dates["date"] = pd.to_datetime(
                    df_with_dates["createdAt"], errors='coerce')
                df_with_dates = df_with_dates.dropna(subset=["date"])

                if not df_with_dates.empty:
                    df_with_dates["month"] = df_with_dates["date"].dt.to_period(
                        "M").astype(str)
                    monthly_counts = df_with_dates.groupby("month").size()

                    timeline_data = [
                        {"month": str(month), "experiences": int(count)}
                        for month, count in monthly_counts.items()
                    ]
    except Exception as e:
        current_app.logger.warning(f"Could not create timeline data: {str(e)}")

    chart_data["timelineData"] = timeline_data

    # 5. Word Frequency Data (for word cloud or bar chart)
    try:
        all_summaries = " ".join(
            df["experienceSummary"].fillna("").astype(str))
        if len(all_summaries.strip()) > 10:
            words = re.findall(r'\b\w+\b', all_summaries.lower())
            common_words = Counter(words).most_common(10)
            chart_data["wordFrequency"] = [
                {"word": word, "frequency": count}
                for word, count in common_words
                if len(word) > 3 and word not in STOP_WORDS
            ]
    except Exception as e:
        current_app.logger.warning(
            f"Could not create word frequency data: {str(e)}")
        chart_data["wordFrequency"] = []

    # 6. Status Distribution Data
    try:
        status_counts = df["status"].value_counts()
        chart_data["statusDistribution"] = [
            {"status": str(status), "count": int(count)}
            for status, count in status_counts.items()
        ]
    except Exception as e:
        current_app.logger.warning(
            f"Could not create status distribution data: {str(e)}")
        chart_data["statusDistribution"] = []

    return chart_data


def generate_comprehensive_chart_data(df, company_name):
    """Generate all chart data matching the CSV analysis functionality"""
    chart_data = {}

    try:
        # 1. Difficulty Distribution (Pie Chart) - Based on roundsData difficulty
        try:
            difficulty_levels = []
            for _, exp in df.iterrows():
                rounds_data = exp.get("roundsData", {})
                for round_type, round_data in rounds_data.items():
                    if isinstance(round_data, dict) and "difficulty" in round_data:
                        difficulty_levels.append(round_data["difficulty"])

            difficulty_counter = Counter(difficulty_levels)
            if difficulty_counter:
                chart_data["difficultyDistribution"] = [
                    {"name": str(diff), "value": int(
                        count), "count": int(count)}
                    for diff, count in difficulty_counter.items()
                ]
        except Exception as e:
            current_app.logger.warning(
                f"Could not create difficulty distribution: {str(e)}")
            chart_data["difficultyDistribution"] = []

        # 2. Average Difficulty by Company (Horizontal Bar Chart)
        try:
            # Calculate average difficulty score per company
            company_difficulty_scores = {}
            for _, exp in df.iterrows():
                company = exp.get("companyName", "Unknown")
                if company not in company_difficulty_scores:
                    company_difficulty_scores[company] = []

                # Calculate average difficulty for this experience
                exp_difficulties = []
                rounds_data = exp.get("roundsData", {})
                for round_data in rounds_data.values():
                    if isinstance(round_data, dict) and "difficulty" in round_data:
                        difficulty_score = {"Easy": 1, "Medium": 2, "Hard": 3}.get(
                            round_data["difficulty"], 2)
                        exp_difficulties.append(difficulty_score)

                if exp_difficulties:
                    company_difficulty_scores[company].append(
                        np.mean(exp_difficulties))

            chart_data["companyDifficulty"] = [
                {
                    "company": company,
                    "avgDifficulty": float(round(np.mean(scores), 2)),
                    "experienceCount": len(scores)
                }
                for company, scores in company_difficulty_scores.items()
                if scores
            ]
        except Exception as e:
            current_app.logger.warning(
                f"Could not create company difficulty: {str(e)}")
            chart_data["companyDifficulty"] = []

        # 3. Questions per Section (Stacked Bar Chart)
        try:
            section_data = []
            for round_type in ["aptitude", "coding", "technical", "hr"]:
                question_count = 0
                for _, exp in df.iterrows():
                    round_data = exp.get("roundsData", {}).get(round_type, {})
                    if isinstance(round_data, dict):
                        # Count questions based on round type
                        if round_type == "aptitude" and "sampleQuestions" in round_data:
                            questions = round_data["sampleQuestions"]
                            if isinstance(questions, list):
                                question_count += len(questions)
                        elif round_type == "coding" and "top3Questions" in round_data:
                            questions = round_data["top3Questions"]
                            if isinstance(questions, list):
                                question_count += len(questions)
                        elif round_type == "technical" and "top5Questions" in round_data:
                            questions = round_data["top5Questions"]
                            if isinstance(questions, list):
                                question_count += len(questions)
                        elif round_type == "hr" and "topQuestions" in round_data:
                            questions = round_data["topQuestions"]
                            if isinstance(questions, list):
                                question_count += len(questions)

                section_data.append({
                    "section": round_type.capitalize(),
                    "questionCount": question_count,
                    "color": CHART_COLORS.get(round_type, "#6b7280")
                })

            chart_data["questionsPerSection"] = section_data
        except Exception as e:
            current_app.logger.warning(
                f"Could not create questions per section: {str(e)}")
            chart_data["questionsPerSection"] = []

        # 4. Round Difficulty Distribution (Pie Chart) - Same as difficulty distribution
        chart_data["roundDifficultyDistribution"] = chart_data.get(
            "difficultyDistribution", [])

        # 5. Feedback Word Frequency (Bar Chart) - Using experienceSummary and round feedback
        try:
            all_feedback = []
            # Add experience summaries
            all_feedback.extend(df["experienceSummary"].fillna("").astype(str))

            # Add round-specific feedback
            for _, exp in df.iterrows():
                rounds_data = exp.get("roundsData", {})
                for round_data in rounds_data.values():
                    if isinstance(round_data, dict) and "feedback" in round_data:
                        all_feedback.append(str(round_data["feedback"]))

            combined_feedback = " ".join(
                [fb for fb in all_feedback if fb.strip()])

            if len(combined_feedback.strip()) > 10:
                words = re.findall(r'\b\w+\b', combined_feedback.lower())
                word_freq = Counter(words)
                common_words = word_freq.most_common(15)
                chart_data["feedbackWordFrequency"] = [
                    {"word": word, "frequency": count}
                    for word, count in common_words
                    if len(word) > 3 and word not in STOP_WORDS
                ]
        except Exception as e:
            current_app.logger.warning(
                f"Could not create word frequency: {str(e)}")
            chart_data["feedbackWordFrequency"] = []

        # 6. Review Sentiment Analysis (Bar Chart)
        try:
            sentiment_data = []
            for round_type in ["aptitude", "coding", "technical", "hr"]:
                ratings = []
                for _, exp in df.iterrows():
                    round_data = exp.get("roundsData", {}).get(round_type, {})
                    if isinstance(round_data, dict) and "difficulty" in round_data:
                        # Convert difficulty to sentiment score
                        sentiment_map = {
                            "Easy": 4, "Medium": 3, "Hard": 2, "Very Hard": 1}
                        ratings.append(sentiment_map.get(
                            round_data["difficulty"], 3))

                if ratings:
                    sentiment_data.append({
                        "round": round_type.capitalize(),
                        "avgSentiment": float(round(np.mean(ratings), 2)),
                        "responseCount": len(ratings)
                    })

            chart_data["reviewSentiment"] = sentiment_data
        except Exception as e:
            current_app.logger.warning(
                f"Could not create review sentiment: {str(e)}")
            chart_data["reviewSentiment"] = []

        # 7. Rounds per Company (Horizontal Bar Chart)
        try:
            company_rounds = df.groupby("companyName").agg({
                "experienceId": "count"
            }).reset_index()

            chart_data["roundsPerCompany"] = [
                {
                    "company": row["companyName"],
                    "roundCount": int(row["experienceId"]),
                    "experienceCount": int(row["experienceId"])
                }
                for _, row in company_rounds.iterrows()
            ]
        except Exception as e:
            current_app.logger.warning(
                f"Could not create rounds per company: {str(e)}")
            chart_data["roundsPerCompany"] = []

        # 8. Question Types Count (Bar Chart)
        try:
            question_types = {
                "Aptitude": 0,
                "Coding": 0,
                "Technical": 0,
                "HR": 0
            }

            for _, exp in df.iterrows():
                rounds_data = exp.get("roundsData", {})
                for round_type in question_types.keys():
                    round_data = rounds_data.get(round_type.lower(), {})
                    if isinstance(round_data, dict):
                        if round_type == "Aptitude" and "sampleQuestions" in round_data:
                            questions = round_data["sampleQuestions"]
                            if isinstance(questions, list):
                                question_types[round_type] += len(questions)
                        elif round_type == "Coding" and "top3Questions" in round_data:
                            questions = round_data["top3Questions"]
                            if isinstance(questions, list):
                                question_types[round_type] += len(questions)
                        elif round_type == "Technical" and "top5Questions" in round_data:
                            questions = round_data["top5Questions"]
                            if isinstance(questions, list):
                                question_types[round_type] += len(questions)
                        elif round_type == "HR" and "topQuestions" in round_data:
                            questions = round_data["topQuestions"]
                            if isinstance(questions, list):
                                question_types[round_type] += len(questions)

            chart_data["questionTypesCount"] = [
                {"type": q_type, "count": count}
                for q_type, count in question_types.items()
            ]
        except Exception as e:
            current_app.logger.warning(
                f"Could not create question types count: {str(e)}")
            chart_data["questionTypesCount"] = []

        # 9. Company vs Round Difficulty Heatmap Data
        try:
            heatmap_data = []
            companies = df["companyName"].unique()
            difficulty_levels = ["Easy", "Medium", "Hard"]

            for company in companies:
                company_data = df[df["companyName"] == company]
                for difficulty in difficulty_levels:
                    count = 0
                    for _, exp in company_data.iterrows():
                        rounds_data = exp.get("roundsData", {})
                        for round_data in rounds_data.values():
                            if isinstance(round_data, dict) and round_data.get("difficulty") == difficulty:
                                count += 1

                    if count > 0:
                        heatmap_data.append({
                            "company": company,
                            "difficulty": difficulty,
                            "count": count
                        })

            chart_data["difficultyHeatmap"] = heatmap_data
        except Exception as e:
            current_app.logger.warning(
                f"Could not create difficulty heatmap: {str(e)}")
            chart_data["difficultyHeatmap"] = []

        # 10. Most Asked Topics (Horizontal Bar Chart)
        try:
            all_topics = []
            for _, exp in df.iterrows():
                rounds_data = exp.get("roundsData", {})
                # Technical topics
                if "technical" in rounds_data and "focusTopics" in rounds_data["technical"]:
                    topics = rounds_data["technical"]["focusTopics"]
                    if isinstance(topics, list):
                        all_topics.extend([str(t) for t in topics])
                # Coding languages
                if "coding" in rounds_data and "languagesUsed" in rounds_data["coding"]:
                    langs = rounds_data["coding"]["languagesUsed"]
                    if isinstance(langs, list):
                        all_topics.extend([str(l) for l in langs])
                # Aptitude question types (extract from sample questions)
                if "aptitude" in rounds_data and "sampleQuestions" in rounds_data["aptitude"]:
                    questions = rounds_data["aptitude"]["sampleQuestions"]
                    if isinstance(questions, list):
                        # Extract topics from aptitude questions
                        for q in questions:
                            if isinstance(q, dict) and "question" in q:
                                question_text = str(q["question"]).lower()
                                if "interest" in question_text:
                                    all_topics.append("Interest Calculation")
                                elif "percentage" in question_text:
                                    all_topics.append("Percentage")
                                elif "equation" in question_text or "math" in question_text:
                                    all_topics.append("Basic Math")

            topic_counter = Counter(all_topics)
            chart_data["mostAskedTopics"] = [
                {"topic": topic, "frequency": count}
                for topic, count in topic_counter.most_common(10)
            ]
        except Exception as e:
            current_app.logger.warning(
                f"Could not create most asked topics: {str(e)}")
            chart_data["mostAskedTopics"] = []

        # 11. Experience Timeline (Line Chart) - Enhanced version
        try:
            if "createdAt" in df.columns and not df["createdAt"].isna().all():
                df_with_dates = df.dropna(subset=["createdAt"]).copy()
                if not df_with_dates.empty:
                    df_with_dates["date"] = pd.to_datetime(
                        df_with_dates["createdAt"], errors='coerce')
                    df_with_dates = df_with_dates.dropna(subset=["date"])

                    if not df_with_dates.empty:
                        df_with_dates["month"] = df_with_dates["date"].dt.to_period(
                            "M").astype(str)
                        timeline_by_status = df_with_dates.groupby(
                            ["month", "status"]).size().unstack(fill_value=0)

                        chart_data["timelineByStatus"] = []
                        for month in timeline_by_status.index:
                            month_data = {"month": month}
                            for status in timeline_by_status.columns:
                                month_data[status.lower()] = int(
                                    timeline_by_status.loc[month, status])
                            chart_data["timelineByStatus"].append(month_data)
        except Exception as e:
            current_app.logger.warning(
                f"Could not create enhanced timeline: {str(e)}")
            chart_data["timelineByStatus"] = []

        # 12. Success Rate by Job Role
        try:
            job_role_success = []
            for job_role in df["jobRole"].unique():
                if pd.notna(job_role) and job_role != "":
                    role_data = df[df["jobRole"] == job_role]
                    if len(role_data) > 0:
                        success_count = len(
                            role_data[role_data["status"] == "Selected"])
                        success_rate = (success_count / len(role_data)) * 100
                        job_role_success.append({
                            "jobRole": job_role,
                            "successRate": float(round(success_rate, 1)),
                            "totalCandidates": len(role_data),
                            "successCount": success_count
                        })

            # Sort by success rate and take top 10
            job_role_success.sort(key=lambda x: x["successRate"], reverse=True)
            chart_data["successRateByJobRole"] = job_role_success[:10]
        except Exception as e:
            current_app.logger.warning(
                f"Could not create job role success: {str(e)}")
            chart_data["successRateByJobRole"] = []

    except Exception as e:
        current_app.logger.error(
            f"Error in comprehensive chart generation: {str(e)}")

    return chart_data


# Constants (add these at the top of your file)
STOP_WORDS = {
    'the', 'and', 'for', 'with', 'this', 'that', 'were', 'have', 'from', 'about',
    'their', 'there', 'what', 'which', 'when', 'would', 'could', 'them', 'these',
    'your', 'some', 'will', 'also', 'than', 'then', 'its', 'into', 'more', 'other',
    'has', 'had', 'such', 'each', 'where', 'made', 'like', 'through', 'were', 'being',
    'over', 'only', 'even', 'back', 'after', 'used', 'state', 'many', 'any', 'between'
}

CHART_COLORS = {
    "aptitude": "#0891b2",
    "coding": "#d97706",
    "technical": "#059669",
    "hr": "#7c3aed",
    "selected": "#10b981",
    "rejected": "#ef4444",
    "pending": "#f59e0b",
    "easy": "#10b981",
    "medium": "#f59e0b",
    "hard": "#ef4444"
}


def get_difficulty_level(score):
    """Convert numerical score to difficulty level"""
    if score < 1.5:
        return "Easy"
    elif score < 2.5:
        return "Medium"
    else:
        return "Hard"


def generate_round_details(df, round_type):
    """Generate detailed analytics for a specific round type"""
    try:
        # Safely filter rounds
        round_experiences = df[df["selectedRounds"].apply(
            lambda x: round_type in x if isinstance(x, list) else False
        )]

        if len(round_experiences) == 0:
            return None

        # Calculate pass rate (simplified - using overall status)
        total_round_experiences = len(round_experiences)
        successful_in_round = len(round_experiences[
            round_experiences["status"] == "Selected"
        ])
        pass_rate = (successful_in_round / total_round_experiences) * \
            100 if total_round_experiences > 0 else 0

        # Calculate metrics with safe data handling
        difficulties = []
        time_limits = []
        all_topics = []
        sample_questions = []

        for _, exp in round_experiences.iterrows():
            round_data = exp.get("roundsData", {}).get(round_type, {})
            if isinstance(round_data, dict):
                # Difficulty
                if "difficulty" in round_data:
                    difficulties.append(str(round_data["difficulty"]))

                # Time limits
                if "timeLimit" in round_data:
                    time_val = round_data["timeLimit"]
                    if isinstance(time_val, (int, float)):
                        time_limits.append(float(time_val))
                    elif isinstance(time_val, str):
                        # Extract numbers from strings like "60 minutes"
                        numbers = re.findall(r'\d+', time_val)
                        if numbers:
                            time_limits.append(float(numbers[0]))

                # Extract topics based on round type
                if round_type == "technical" and "focusTopics" in round_data:
                    topics = round_data["focusTopics"]
                    if isinstance(topics, list):
                        all_topics.extend([str(t) for t in topics])
                elif round_type == "coding" and "languagesUsed" in round_data:
                    langs = round_data["languagesUsed"]
                    if isinstance(langs, list):
                        all_topics.extend([str(l) for l in langs])
                elif round_type == "aptitude":
                    # Extract topics from aptitude questions
                    if "sampleQuestions" in round_data:
                        questions = round_data["sampleQuestions"]
                        if isinstance(questions, list):
                            for q in questions:
                                if isinstance(q, dict) and "question" in q:
                                    question_text = str(q["question"]).lower()
                                    if "interest" in question_text:
                                        all_topics.append(
                                            "Interest Calculation")
                                    elif "percentage" in question_text:
                                        all_topics.append("Percentage")
                                    elif any(math_term in question_text for math_term in ['+', '-', '*', '/', 'math', 'equation']):
                                        all_topics.append("Basic Math")

                # Extract sample questions
                question_keys = {
                    "aptitude": "sampleQuestions",
                    "coding": "top3Questions",
                    "technical": "top5Questions",
                    "hr": "topQuestions"
                }

                q_key = question_keys.get(round_type)
                if q_key and q_key in round_data:
                    questions = round_data[q_key]
                    if isinstance(questions, list):
                        sample_questions.extend(questions)

        # Get most common difficulty
        difficulty_counter = Counter(difficulties)
        most_common_difficulty = difficulty_counter.most_common(
            1)[0][0] if difficulties else "Unknown"

        # Get average time limit
        avg_time_limit = np.mean(time_limits) if time_limits else "Varies"

        # Get top topics
        topic_counter = Counter(all_topics)
        top_topics = [str(topic) for topic, _ in topic_counter.most_common(5)]

        # Prepare sample questions (limit to 3)
        formatted_questions = []
        for i, q in enumerate(sample_questions[:3]):
            if isinstance(q, dict) and "question" in q:
                formatted_questions.append({
                    "question": str(q.get("question", "")),
                    "answer": str(q.get("answer", "Not provided")),
                    "difficulty": str(q.get("difficulty", most_common_difficulty))
                })
            elif isinstance(q, str):
                formatted_questions.append({
                    "question": str(q),
                    "answer": "Not provided",
                    "difficulty": str(most_common_difficulty)
                })

        return {
            "passRate": float(round(pass_rate, 1)),
            "avgScore": float(round(np.mean(round_experiences["overallRating"]), 1)) if len(round_experiences) > 0 else 0.0,
            "difficulty": str(most_common_difficulty),
            "timeLimit": f"{avg_time_limit:.0f} mins" if isinstance(avg_time_limit, (int, float)) else str(avg_time_limit),
            "topics": top_topics,
            "sampleQuestions": formatted_questions,
            "totalOccurrences": int(total_round_experiences)
        }

    except Exception as e:
        current_app.logger.error(
            f"Error generating round details for {round_type}: {str(e)}")
        return None


def generate_rounds_summary(df, company_name):
    """Generate summary statistics for rounds analytics"""
    total_experiences = len(df)
    successful_experiences = len(df[df["status"] == "Selected"])

    # Most common round combinations
    round_combinations = df["selectedRounds"].apply(tuple).value_counts()
    most_common_combination = round_combinations.index[0] if not round_combinations.empty else [
    ]

    # Average number of rounds
    avg_rounds = df["selectedRounds"].apply(len).mean()

    return {
        "totalExperiences": total_experiences,
        "successRate": (successful_experiences / total_experiences) * 100 if total_experiences > 0 else 0,
        "mostCommonRounds": list(most_common_combination),
        "averageRoundsPerInterview": round(avg_rounds, 1),
        "analysisDate": datetime.utcnow().isoformat()
    }


@analysis_bp.route("/companies/<company_id>/rounds-analytics", methods=["GET", "OPTIONS"])
def get_company_rounds_analytics(company_id):
    """Get comprehensive rounds analytics with generated charts"""
    try:
        # Handle preflight CORS request
        if request.method == "OPTIONS":
            return jsonify({"success": True}), 200

        db = current_app.config["MONGO_DB"]

        # Get company data
        company = db.companies.find_one({
            "$or": [
                {"companyId": company_id},
                {"_id": ObjectId(company_id) if ObjectId.is_valid(
                    company_id) else None}
            ]
        })

        if not company:
            return jsonify({"success": False, "message": "Company not found"}), 404

        # Get experiences with error handling
        try:
            experiences_cursor = db.experiences.find({
                "$or": [
                    {"companyId": company_id},
                    {"_id": ObjectId(company_id) if ObjectId.is_valid(
                        company_id) else None}
                ]
            })
            experiences = list(experiences_cursor)
        except Exception as e:
            current_app.logger.error(f"Database error: {str(e)}")
            return jsonify({"success": False, "message": "Database error"}), 500

        if not experiences:
            return jsonify({
                "success": False,
                "message": "No experiences found for analysis"
            }), 404

        # Convert to DataFrame with proper error handling
        df_data = []
        for exp in experiences:
            try:
                row = {
                    "experienceId": str(exp.get("experienceId", "")),
                    "companyName": str(exp.get("companyName", company.get("name", "Unknown"))),
                    "jobRole": str(exp.get("jobRole", "")),
                    "status": str(exp.get("status", "Pending")),
                    "overallRating": float(exp.get("overallRating", 0)),
                    "selectedRounds": list(exp.get("selectedRounds", [])),
                    "roundsData": dict(exp.get("roundsData", {})),
                    "experienceSummary": str(exp.get("experienceSummary", "")),
                    "createdAt": exp.get("createdAt")
                }
                df_data.append(row)
            except Exception as e:
                current_app.logger.warning(
                    f"Error processing experience: {str(e)}")
                continue

        if not df_data:
            return jsonify({"success": False, "message": "No valid experience data"}), 404

        df = pd.DataFrame(df_data)

        # Generate rounds analytics
        rounds_analytics = generate_rounds_analytics_data(
            df, company.get("name", "Unknown Company"))

        response = jsonify({
            "success": True,
            "roundsAnalytics": convert_numpy_types(rounds_analytics),
            "metadata": {
                "totalExperiences": len(experiences),
                "companyName": company.get("name", "Unknown Company"),
                "generatedAt": datetime.utcnow().isoformat()
            }
        })

        # Add CORS headers
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers',
                             'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods',
                             'GET,PUT,POST,DELETE,OPTIONS')

        return response, 200

    except Exception as e:
        current_app.logger.error(f"Get rounds analytics error: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500
