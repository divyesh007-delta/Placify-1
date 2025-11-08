# # from twilio.rest import Client
# # import os
# # from dotenv import load_dotenv

# # load_dotenv()


# # class SMSService:
# #     def __init__(self):
# #         self.account_sid = os.getenv('TWILIO_SID')
# #         self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
# #         self.client = Client(self.account_sid, self.auth_token)
# #         self.twilio_phone = os.getenv('TWILIO_PHONE')
# #         self.verify_sid = os.getenv('VERIFY_SID')

# #         # Validate critical configuration
# #         if not all([self.account_sid, self.auth_token, self.verify_sid]):
# #             raise ValueError("Missing required Twilio configuration")

# #         print(f"🔧 [DEBUG] Twilio Verify SID: {self.verify_sid}")

# #     def send_otp_sms(self, to_phone):
# #         """Start Twilio verification flow - use v2 API consistently"""
# #         try:
# #             print(f"📲 [DEBUG] Starting Twilio verification for: {to_phone}")
# #             print(f"🔧 [DEBUG] Using Verify Service SID: {self.verify_sid}")

# #             # Use v2 API consistently - FIXED
# #             verification = self.client.verify.v2.services(self.verify_sid) \
# #                 .verifications \
# #                 .create(to=to_phone, channel='sms')

# #             print(
# #                 f"✅ [DEBUG] Twilio verification initiated: {verification.sid}")
# #             print(f"📊 [DEBUG] Verification status: {verification.status}")
# #             return True

# #         except Exception as e:
# #             print(f"❌ [DEBUG] Failed to start Twilio verification: {str(e)}")
# #             return False

# #     def verify_phone_code(self, phone, code):
# #         """Verify the code using Twilio's v2 service"""
# #         try:
# #             print(f"🔍 [DEBUG] Verifying code {code} for phone: {phone}")

# #             # Use v2 API consistently - FIXED
# #             verification_check = self.client.verify.v2.services(self.verify_sid) \
# #                 .verification_checks \
# #                 .create(to=phone, code=code)

# #             print(
# #                 f"📊 [DEBUG] Verification check status: {verification_check.status}")
# #             return verification_check.status == 'approved'

# #         except Exception as e:
# #             print(f"❌ [DEBUG] Verification check failed: {str(e)}")
# #             return False
# # import os
# # from twilio.rest import Client
# # from dotenv import load_dotenv

# # load_dotenv()

# # # Find your Account SID and Auth Token at twilio.com/console
# # # and set the environment variables. See http://twil.io/secure
# # account_sid = os.getenv('TWILIO_SID')
# # auth_token = os.getenv('TWILIO_AUTH_TOKEN')
# # verify_sid=os.getenv('VERIFY_SID')
# # print(f"Account SID: {account_sid}")
# # print(f"Auth Token: {auth_token}")
# # client = Client(account_sid, auth_token)
# # if client is None:
# #     print("Client is None")
# # else:
# #     print("Client initialized successfully")

# # verification = client.verify.v2.services(verify_sid).verifications.create(channel="sms", to="+919313566641")

# # print(verification.status)
# # from vonage_sms import SmsMessage, SmsResponse
# # from vonage import Auth, Vonage
# # from vonage_messages import Sms

# # # if you want to manage your secret, please do so by visiting your API Settings page in your dashboard
# # client = Vonage(Auth(key="ef033a6b", secret="N3lFKQzhD1s72qLk"))

# # responseData = Sms(from: "Vonage APIs",
# #         "to": "918141403000",
# #         "text": "A text message sent using the Nexmo SMS API",
# # )

# # if responseData["messages"][0]["status"] == "0":
# #     print("Message sent successfully.")
# # else:
# #     print(
# #         f"Message failed with error: {responseData['messages'][0]['error-text']}")


# # vonage_client = Vonage(
# #     Auth(application_id='ef033a6b', private_key='N3lFKQzhD1s72qLk'))

# # message = Sms(
# #     from_='Vonage APIs',
# #     to='918141403000',
# #     text='This is a test message sent from the Vonage Python SDK',
# # )

# # vonage_client.messages.send(message)

# from vonage import Auth, Vonage
# from vonage_sms import SmsMessage, SmsResponse

# client = Vonage(Auth(api_key='ef033a6b', api_secret='N3lFKQzhD1s72qLk'))

# message = SmsMessage(
#     to='+919313566641',
#     from_='Placify',
#     text="A text message sent using the Vonage SMS API.",
# )

# response: SmsResponse = client.sms.send(message)
# print(response)
import time
import requests
import json
import os
from dotenv import load_dotenv

# load_dotenv()


# class GupshupWhatsAppService:
#     def __init__(self):
#         self.api_key = 'x4r0srdazproougcgm813fa2gliugolf'
#         self.app_name = 'Placify'

#     def send_otp_message(self, to_phone, otp_code):
#         """Send WhatsApp via Gupshup"""
#         try:
#             url = "https://api.gupshup.io/sm/api/v1/msg"

#             headers = {
#                 'Content-Type': 'application/x-www-form-urlencoded',
#                 'apikey': self.api_key
#             }

#             data = {
#                 'channel': 'whatsapp',
#                 'source': self.app_name,
#                 'destination': to_phone,
#                 'message': json.dumps({
#                     "type": "text",
#                     "text": f"Your BVM Placement OTP is: {otp_code}. Valid for 10 minutes."
#                 }),
#                 'src.name': self.app_name
#             }

#             response = requests.post(url, headers=headers, data=data)

#             if response.status_code == 202:
#                 print(f"✅ [DEBUG] Gupshup WhatsApp sent to {to_phone}")
#                 return True
#             else:
#                 print(f"❌ [DEBUG] Gupshup error: {response.text}")
#                 return False

#         except Exception as e:
#             print(f"❌ [DEBUG] Gupshup error: {e}")
#             return False


load_dotenv()


class GupshupWhatsAppService:
    def __init__(self):
        self.api_key = os.getenv('GUPSHUP_API_KEY')
        self.app_name = os.getenv('GUPSHUP_APP_NAME')
        self.base_url = "https://api.gupshup.io/sm/api/v1"

        print(f"🔧 [DEBUG] Gupshup Config:")
        print(
            f"   API Key: {self.api_key[:10]}...{self.api_key[-5:] if self.api_key else 'None'}")
        print(f"   App Name: {self.app_name}")

    def send_otp_message(self, to_phone, otp_code):
        """Send WhatsApp via Gupshup"""
        try:
            url = f"{self.base_url}/msg"

            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'apikey': self.api_key
            }

            # Create message payload
            message_payload = {
                "type": "text",
                "text": f"🔐 Your BVM Placement Portal OTP is: *{otp_code}*\n\nThis code will expire in 10 minutes. Do not share this code with anyone."
            }

            data = {
                'channel': 'whatsapp',
                'source': self.app_name,
                'destination': to_phone,
                'message': json.dumps(message_payload),
                'src.name': self.app_name
            }

            print(f"📤 [DEBUG] Sending to Gupshup API...")
            print(f"   URL: {url}")
            print(f"   To: {to_phone}")
            print(f"   Message: {message_payload['text']}")

            response = requests.post(url, headers=headers, data=data)

            print(f"📥 [DEBUG] Response Status: {response.status_code}")
            print(f"📥 [DEBUG] Response Headers: {dict(response.headers)}")
            print(f"📥 [DEBUG] Response Text: {response.text}")

            if response.status_code == 202:
                print(
                    f"✅ [DEBUG] Gupshup WhatsApp accepted for delivery to {to_phone}")
                return True
            else:
                print(
                    f"❌ [DEBUG] Gupshup API error: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            print(f"❌ [DEBUG] Gupshup connection error: {e}")
            return False

    def check_balance(self):
        """Check Gupshup account balance"""
        try:
            url = f"{self.base_url}/wallet/balance"

            headers = {
                'apikey': self.api_key
            }

            response = requests.get(url, headers=headers)

            if response.status_code == 200:
                balance_data = response.json()
                print(f"💰 [DEBUG] Account Balance: {balance_data}")
                return balance_data
            else:
                print(f"❌ [DEBUG] Balance check failed: {response.text}")
                return None

        except Exception as e:
            print(f"❌ [DEBUG] Balance check error: {e}")
            return None

    def test_connection(self):
        """Test basic connection to Gupshup"""
        try:
            print("🔌 [DEBUG] Testing Gupshup connection...")

            # Check if credentials are set
            if not self.api_key or not self.app_name:
                print(
                    "❌ [DEBUG] Missing GUPSHUP_API_KEY or GUPSHUP_APP_NAME in .env file")
                return False

            # Test balance endpoint (usually doesn't require special permissions)
            balance = self.check_balance()
            if balance:
                print("✅ [DEBUG] Gupshup connection successful")
                return True
            else:
                print("❌ [DEBUG] Gupshup connection test failed")
                return False

        except Exception as e:
            print(f"❌ [DEBUG] Connection test error: {e}")
            return False


def comprehensive_test():
    """Run comprehensive tests on Gupshup service"""
    print("🚀 [TEST] Starting Comprehensive Gupshup WhatsApp Test")
    print("=" * 60)

    # Initialize service
    whatsapp_service = GupshupWhatsAppService()

    # Test 1: Connection Test
    print("\n1. 🔌 Testing Connection & Credentials...")
    connection_ok = whatsapp_service.test_connection()

    if not connection_ok:
        print("❌ Connection test failed. Please check your .env file")
        return

    # Test 2: Balance Check
    print("\n2. 💰 Checking Account Balance...")
    whatsapp_service.check_balance()

    # Test 3: Send Test Messages to Different Numbers
    print("\n3. 📱 Testing WhatsApp Message Delivery...")

    test_cases = [
        {
            "phone": "918141403000",  # Replace with actual test number
            "otp": "123456",
            "description": "Primary test number"
        },
        {
            "phone": "+918141403000",  # International format
            "otp": "654321",
            "description": "International format number"
        },
        {
            "phone": "8141403000",  # Local format
            "otp": "987654",
            "description": "Local format number"
        }
    ]

    for i, test_case in enumerate(test_cases, 1):
        print(f"\n   📨 Test {i}: {test_case['description']}")
        print(f"      Phone: {test_case['phone']}")
        print(f"      OTP: {test_case['otp']}")

        success = whatsapp_service.send_otp_message(
            test_case['phone'],
            test_case['otp']
        )

        if success:
            print(f"      ✅ Message accepted for delivery")
        else:
            print(f"      ❌ Message delivery failed")

        # Wait 2 seconds between tests to avoid rate limiting
        if i < len(test_cases):
            time.sleep(2)

    print("\n" + "=" * 60)
    print("🎯 [TEST] Comprehensive testing completed!")


def quick_test():
    """Quick test with single number"""
    print("⚡ [TEST] Running Quick Gupshup Test")

    whatsapp_service = GupshupWhatsAppService()

    # Test credentials
    if not whatsapp_service.api_key or not whatsapp_service.app_name:
        print("❌ Missing environment variables:")
        print(
            f"   GUPSHUP_API_KEY: {'Set' if whatsapp_service.api_key else 'Missing'}")
        print(
            f"   GUPSHUP_APP_NAME: {'Set' if whatsapp_service.app_name else 'Missing'}")
        return

    # Test with your number
    test_phone = input(
        "Enter phone number to test (with country code): ").strip()
    test_otp = "999888"

    print(f"📱 Testing with: {test_phone}")
    print(f"🔢 Test OTP: {test_otp}")

    success = whatsapp_service.send_otp_message(test_phone, test_otp)

    if success:
        print("✅ Test message accepted by Gupshup!")
        print("💡 Check your WhatsApp in 1-2 minutes")
    else:
        print("❌ Test failed. Check the errors above.")


def integration_test():
    """Test integration with OTP service"""
    print("🔗 [TEST] Testing Integration with OTP Service")

    from datetime import datetime

    class MockOTPService:
        def generate_otp(self, length=6):
            return ''.join([str((i * 7) % 10) for i in range(length)])

    # Test the full flow
    mock_otp_service = MockOTPService()
    whatsapp_service = GupshupWhatsAppService()

    test_email = "test@bvmengineering.ac.in"
    test_phone = "918141403000"  # Replace with actual number

    print(f"📧 Test Email: {test_email}")
    print(f"📱 Test Phone: {test_phone}")

    # Generate OTP
    otp_code = mock_otp_service.generate_otp()
    print(f"🔢 Generated OTP: {otp_code}")

    # Send via WhatsApp
    print("📤 Sending OTP via WhatsApp...")
    success = whatsapp_service.send_otp_message(test_phone, otp_code)

    if success:
        print("✅ Integration test successful!")
        print("   OTP generated and sent via WhatsApp")
    else:
        print("❌ Integration test failed!")


if __name__ == "__main__":
    print("Gupshup WhatsApp Service Testing Suite")
    print("Choose test type:")
    print("1. Quick Test (Single Number)")
    print("2. Comprehensive Test (Multiple Tests)")
    print("3. Integration Test (Full OTP Flow)")

    choice = input("Enter choice (1-3): ").strip()

    if choice == "1":
        quick_test()
    elif choice == "2":
        comprehensive_test()
    elif choice == "3":
        integration_test()
    else:
        print("Running quick test by default...")
        quick_test()
