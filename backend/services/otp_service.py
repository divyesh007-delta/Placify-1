import redis
from redis import ConnectionPool
import os
import json
from datetime import timedelta
import random
import string
import traceback
from dotenv import load_dotenv
# from .sms_service import SMSService


load_dotenv()


class OTPService:
    def __init__(self, app=None):
        """Initialize Redis connection with connection pooling for OTP management."""

        self.connection_pool = None
        self.redis_client = None
        self.otp_expiry = 600  # 10 minutes

    
        """Initialize Redis with Flask app configuration."""
        try:
            # Get Redis configuration from app config or environment
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
            redis_password = os.getenv('REDIS_PASSWORD')


            # Create connection pool with optimized settings
            self.connection_pool = ConnectionPool.from_url(
                redis_url,
                decode_responses=True,
                max_connections=20,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )

            # Create Redis client with connection pool
            self.redis_client = redis.Redis(
                connection_pool=self.connection_pool)

            # Test connection
            pong = self.redis_client.ping()

        except Exception as e:
            traceback.print_exc()
            # Fallback: create a basic connection without pool
            try:
                self.redis_client = redis.Redis.from_url(
                    os.getenv('REDIS_URL', 'redis://localhost:6379'),
                    password=os.getenv('REDIS_PASSWORD'),
                    decode_responses=True
                )
            except Exception as fallback_error:
                print(
                    f"❌ [DEBUG] Fallback connection also failed: {fallback_error}")

    # ----------------------------------------------------------------------
    def generate_otp(self, length=6):
        """Generate a random numeric OTP."""
        otp = ''.join(random.choices(string.digits, k=length))
        return otp

    # ----------------------------------------------------------------------
    def _get_cache_key(self, email, otp_type=None):
        """Generate consistent cache keys with proper naming convention."""
        if otp_type:
            return f"otp:{email}:{otp_type}"
        return f"otp:{email}"

    # ----------------------------------------------------------------------
    def store_email_otp(self, email, email_otp):
        """Store email OTP using simple Redis set operation."""

        try:
            # Create OTP data structure
            otp_data = {
                'email_otp': email_otp,
                'email_attempts': 0,
                'email_verified': False,
                'created_at': self._get_current_timestamp()
            }

            # Use simple Redis set with expiry - just like in the screenshot example
            key = self._get_cache_key(email)
            result = self.redis_client.setex(
                key,
                timedelta(seconds=self.otp_expiry),
                json.dumps(otp_data)
            )

            return True

        except Exception as e:
            print(f"❌ [DEBUG] Failed to store email OTP: {e}")
            traceback.print_exc()
            return False


    # ----------------------------------------------------------------------
    def get_otp_data(self, email):
        """Retrieve OTP data using simple Redis get operation."""
        key = self._get_cache_key(email)

        try:
            # Use simple Redis get - just like in the screenshot example
            data = self.redis_client.get(key)
            if data:
                parsed_data = json.loads(data)
                return parsed_data
            else:
                return None

        except json.JSONDecodeError as e:
            return None
        except Exception as e:
            return None

    # ----------------------------------------------------------------------
    def delete_otp_data(self, email):
        """Delete OTP data using simple Redis delete operation."""
        key = self._get_cache_key(email)

        try:
            # Use simple Redis delete
            result = self.redis_client.delete(key)
            return result > 0

        except Exception as e:
            traceback.print_exc()
            return False

    # ----------------------------------------------------------------------
    def _get_current_timestamp(self):
        """Get current timestamp for tracking."""
        from datetime import datetime
        return datetime.utcnow().isoformat()

    # ----------------------------------------------------------------------
    def increment_email_attempts(self, email):
        """Increment failed email attempt counter."""

        try:
            otp_data = self.get_otp_data(email)
            if otp_data:
                otp_data['email_attempts'] = otp_data.get(
                    'email_attempts', 0) + 1
                otp_data['updated_at'] = self._get_current_timestamp()

                # Use simple set to update
                key = self._get_cache_key(email)
                result = self.redis_client.setex(
                    key,
                    timedelta(seconds=self.otp_expiry),
                    json.dumps(otp_data)
                )
                
                return True
            else:
                return False

        except Exception as e:
            traceback.print_exc()
            return False


    def mark_email_verified(self, email):
        """Mark email as verified."""

        try:
            otp_data = self.get_otp_data(email)
            if otp_data:
                otp_data['email_verified'] = True
                otp_data['email_verified_at'] = self._get_current_timestamp()
                otp_data['updated_at'] = self._get_current_timestamp()

                # Use simple set to update
                key = self._get_cache_key(email)
                result = self.redis_client.setex(
                    key,
                    timedelta(seconds=self.otp_expiry),
                    json.dumps(otp_data)
                )
                return True
            else:
                return False

        except Exception as e:
            print(f"❌ [DEBUG] Failed to mark email as verified: {e}")
            traceback.print_exc()
            return False


    # ----------------------------------------------------------------------
    # Health Check
    # ----------------------------------------------------------------------

    def health_check(self):
        """Check Redis connection health."""
        try:
            if self.redis_client:
                return self.redis_client.ping()
            return False
        except:
            return False
        
        
        
        
        
        
        
        
        
        
        
        
    # def mark_phone_verified(self, email):
    #     """Mark phone as verified."""
    #     print(f"✅ [DEBUG] Marking phone as verified for {email}")

    #     try:
    #         otp_data = self.get_otp_data(email)
    #         if otp_data:
    #             otp_data['phone_verified'] = True
    #             otp_data['phone_verified_at'] = self._get_current_timestamp()
    #             otp_data['updated_at'] = self._get_current_timestamp()

    #             # Use simple set to update
    #             key = self._get_cache_key(email)
    #             result = self.redis_client.setex(
    #                 key,
    #                 timedelta(seconds=self.otp_expiry),
    #                 json.dumps(otp_data)
    #             )
    #             print(f"✅ [DEBUG] Phone marked as verified for {email}")
    #             return True
    #         else:
    #             print(
    #                 f"⚠️ [DEBUG] No OTP data found to mark phone as verified for {email}")
    #             return False

    #     except Exception as e:
    #         print(f"❌ [DEBUG] Failed to mark phone as verified: {e}")
    #         traceback.print_exc()
    #         return False


    # def increment_phone_attempts(self, email):
    #     """Increment failed phone attempt counter."""
    #     print(f"📈 [DEBUG] Incrementing phone attempt count for {email}")

    #     try:
    #         otp_data = self.get_otp_data(email)
    #         if otp_data:
    #             otp_data['phone_attempts'] = otp_data.get(
    #                 'phone_attempts', 0) + 1
    #             otp_data['updated_at'] = self._get_current_timestamp()

    #             # Use simple set to update
    #             key = self._get_cache_key(email)
    #             result = self.redis_client.setex(
    #                 key,
    #                 timedelta(seconds=self.otp_expiry),
    #                 json.dumps(otp_data)
    #             )
    #             print(
    #                 f"✅ [DEBUG] Phone attempt count incremented to {otp_data['phone_attempts']}")
    #             return True
    #         else:
    #             print(
    #                 f"⚠️ [DEBUG] No OTP data found to increment phone attempts for {email}")
    #             return False

    #     except Exception as e:
    #         print(f"❌ [DEBUG] Failed to increment phone attempts: {e}")
    #         traceback.print_exc()
    #         return False

    # ----------------------------------------------------------------------

    # def start_phone_verification(self, email, phone):
    #  """Start Twilio OTP verification for phone numbers only"""
    #  try:
    #     sms_service = SMSService()
    #     verification_started = sms_service.send_otp_sms(phone)

    #     if not verification_started:
    #         return False

    #     # Store verification metadata (no OTP stored)
    #     otp_data = {
    #         'phone': phone,
    #         'phone_verified': False,
    #         'phone_attempts': 0,
    #         'created_at': self._get_current_timestamp(),
    #         'updated_at': self._get_current_timestamp()
    #     }

    #     key = self._get_cache_key(email)
    #     result = self.redis_client.setex(
    #         key,
    #         timedelta(seconds=self.otp_expiry),
    #         json.dumps(otp_data)
    #     )

    #     print(f"✅ [DEBUG] Started Twilio verification for phone {phone}")
    #     return True

    #  except Exception as e:
    #     print(f"❌ [DEBUG] Failed to start phone verification: {e}")
    #     traceback.print_exc()
    #     return False

    # def verify_phone_code(self, email, phone, otp_code):
    #  """Verify phone OTP using Twilio Verify"""
    #  try:
    #     sms_service = SMSService()
    #     is_verified = sms_service.verify_phone_code(phone, otp_code)

    #     if is_verified:
    #         self.mark_phone_verified(email)
    #         print(f"✅ [DEBUG] Phone {phone} verified for {email}")
    #         return True
    #     else:
    #         self.increment_phone_attempts(email)
    #         print(f"⚠️ [DEBUG] Invalid OTP for {phone}")
    #         return False

    #  except Exception as e:
    #     print(f"❌ [DEBUG] Verification error for {phone}: {e}")
    #     traceback.print_exc()
    #     return False
