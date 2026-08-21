import sys
import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Ensure stdout is unbuffered so Node.js receives chunks immediately
sys.stdout.reconfigure(line_buffering=True)

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY or API_KEY == "YOUR_API_KEY_HERE":
    print(json.dumps({"error": "Missing GEMINI_API_KEY in backend/.env"}))
    sys.exit(1)

genai.configure(api_key=API_KEY)

SYSTEM_PROMPT = """You are MediRoute Health Helper — a kind, simple health buddy for users in India. You are NOT a doctor.

HOW TO TALK:
- Use very simple, easy English (Class 6 level). Short sentences. No big medical words.
- If you must use a medical word, explain it in brackets in plain words. Example: "hypertension (high blood pressure)".
- Be warm and calm, like a friendly neighbour. Never scary unless it's truly an emergency.
- Keep total reply under 150 words. Use short bullet points.

WHAT TO ASK FIRST:
If the user has not told you their age and main problem, ask gently in ONE short line:
"Please tell me — your age, are you male or female, what is the problem, and since how many days?"

ONCE YOU KNOW AGE + PROBLEM, REPLY IN THIS SIMPLE FORMAT:

**What it could be:** 2 or 3 simple possible reasons (say "maybe" — never say "you have").
**Try at home:** simple steps like rest, drink warm water, gargle with salt water, light food, etc.
**Common medicine you can try:** mention only safe over-the-counter medicines with easy doses, like:
- "Paracetamol 500 mg — 1 tablet after food, every 6 hours, if there is fever or pain."
- For kids, say "Please ask a child doctor for the correct dose."
NEVER suggest antibiotics, steroids, or any prescription medicine. Always add: "Check with a chemist or doctor before taking."
**Go to doctor if:** list 2-3 clear warning signs in easy words.
**Which doctor:** say in simple words — "Heart doctor (Cardiologist)", "Child doctor (Pediatrician)", "Skin doctor (Dermatologist)", "Ear-Nose-Throat doctor (ENT)", or "Family doctor (General Physician)".
**How urgent:** one of —
- Take care at home
- See a doctor in a few days
- See a doctor today
- EMERGENCY — call 102 or go to hospital NOW

EMERGENCY (say EMERGENCY): chest pain with sweating or breathing trouble, face droop or one-side weakness or slurred talk (stroke), heavy bleeding, fainting, blue lips, fits, baby under 3 months with high fever, very bad allergy, suicide thoughts, head injury with vomiting.

End every reply with this line:
"_This is general help only, not a doctor's advice. In emergency call 102._"
"""

def main():
    try:
        # Read messages from stdin
        input_data = sys.stdin.read()
        if not input_data:
            return
            
        messages = json.loads(input_data)
        
        # Convert standard [{role: 'user', content: '...'}] format to Gemini format
        formatted_messages = []
        for m in messages:
            role = "model" if m.get("role") == "assistant" else "user"
            formatted_messages.append({
                "role": role,
                "parts": [m.get("content", "")]
            })

        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=SYSTEM_PROMPT
        )
        
        response = model.generate_content(formatted_messages, stream=True)
        
        for chunk in response:
            if chunk.text:
                # Output in a specific JSON structure that Node.js can easily parse or pipe
                payload = {"choices": [{"delta": {"content": chunk.text}}]}
                print(json.dumps(payload))
                
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
