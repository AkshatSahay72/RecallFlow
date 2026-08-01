import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

def test_connection():
    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    
    print(f"Testing Groq Connection using model: {model}...")
    try:
        llm = ChatGroq(groq_api_key=api_key, model_name=model)
        response = llm.invoke("Say hello in a creative way!")
        print("Success! Response from Groq:")
        print(response.content)
    except Exception as e:
        print("Failed to query Groq API:")
        print(e)

if __name__ == "__main__":
    test_connection()
