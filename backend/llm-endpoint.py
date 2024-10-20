import os
from dotenv import load_dotenv
from groq import Groq
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
import logging
import re
import json
load_dotenv()
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

## STRICTLY FOR TESTING PURPOSES
# FastAPI startup event
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to execute on startup
    print("Application is starting up...")
    initialize_user_state()
    yield  # This is where the application runs
    # Code to execute on shutdown
    print("Application is shutting down...")
app = FastAPI(lifespan=lifespan)

def load_user_data(user_id: str):
    if os.path.exists("users.json"):
        with open("users.json", "r") as file:
            data = json.load(file)
            return data["users"].get(user_id, None)  
    return None

def save_user_data(user_id: str, user_state: dict):
    if os.path.exists("users.json"):
        with open("users.json", "r") as file:
            data = json.load(file)
    else:
        data = {"users": {}}

    # Update or create the user's state
    data["users"][user_id] = user_state

    # Write the updated data back to the file
    with open("users.json", "w") as file:
        json.dump(data, file, indent=4)


# Middleware to load/save user state
class UserStateMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        user_id = request.headers.get("user_id")
        
        if not user_id:
            user_id = "local"
           # raise HTTPException(status_code=400, detail="user_id header is required")

        # Load the user state
        user_state = load_user_data(user_id)
        if user_state is None:
            user_state = {
                "event": 0,
                "multiplier": 0,
                "conversation_history": [],
                "correct_options": [],
                "current_choice": ""
            }
        
        # Attach user_state to the request object so it can be accessed in routes
        request.state.user_state = user_state
        request.state.user_id = user_id
        
        # Proceed with the request
        response = await call_next(request)
        
        # After the request is processed, save the updated user state
        save_user_data(user_id, request.state.user_state)
        
        return response

# Add the middleware to FastAPI
app.add_middleware(UserStateMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to the specific origins you want to allow
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)
#for testing purpose 
# Initialize or reset user state
def initialize_user_state():
    with open("users.json", "w") as f:
        initial_data = {
            "users": {
                "local": {
                    "event": 0,
                    "multiplier": 0,
                    "conversation_history": [],
                    "correct_options": [],
                    "current_choice": ""
                }
            }
        }
        json.dump(initial_data, f, indent=4)


def initialize_user_state():
    initial_data = {
        "users": {
            "local": {
                "event": 0,
                "multiplier": 0,
                "conversation_history": [],
                "correct_options": [],
                "current_choice": ""
            }
        }
    }
    
    with open("users.json", "w") as f:
        json.dump(initial_data, f, indent=4)




class UserInput(BaseModel):
    choice: str  # Player's choice (A, B, C, D)

def check_choice(choice,first_event_crr_options):
    if choice in first_event_crr_options:
       # print("okey")
       # print(first_event_crr_options)
        return True
    return False
# Game state for each player session


@app.get("/")
async def read_root(request: Request):
    
    player_state = request.state.user_state
    if not player_state:
        return {"message": "No game state found."}
    return {"Hello": f"World\n{player_state['correct_options']} current_choice: {player_state['current_choice']}"}
    

@app.post("/start_game/")
async def start_game(request: Request):
    player_state = request.state.user_state
    scenario_prompt = os.environ.get("scenario_prompt")
    first_event_req= os.environ.get("first_event_req")
    conversation_history = player_state["conversation_history"]
    # Generate story
    chat_completion = client.chat.completions.create(
    messages=[
        {"role": "user", "content": scenario_prompt}
    ],
    model="llama3-8b-8192",
)

    story = chat_completion.choices[0].message.content
    # generate first event and options
    conversation_history = [
        {"role": "user", "content": scenario_prompt},
        {"role": "assistant", "content": story},
        {"role": "user", "content": f"{first_event_req}"}
    ]
    chat_completion_event1 = client.chat.completions.create(
        messages=conversation_history,
        model="llama3-8b-8192",
    )
    first_event = chat_completion_event1.choices[0].message.content
    event_options = first_event.split("\n")
    print(event_options)
    options = [text for text in event_options if text.startswith("Option")]
    print(options)
    event_parts = first_event.split("Option")

    # The first part contains the main event description
    event_without_options = event_parts[0].strip()

    #generate first event correct options
    conversation_history.extend([
        {"role": "assistant", "content": first_event},
        {"role": "user", "content": "Give the correct options for first event in python list format eg.[A,B,C] (do not mention anything else only give as asked)"},
    ])
    chat_completion_event1_options = client.chat.completions.create(
        messages=conversation_history,
        model="llama3-8b-8192",
    )
    first_event_crr_options = chat_completion_event1_options.choices[0].message.content

    player_state["event"]=1
    #print(conversation_history)
    """match = re.search(r'\[(.*?)\]', first_event_crr_options)
    if match:
        correct_options = match.group(0)  # This gets the full match, including brackets
        print(correct_options)  # Output: [A, B, C]
    else:
        print("No options found")"""
    player_state["conversation_history"] = conversation_history
    player_state["correct_options"]= first_event_crr_options
   # print("story:",story,"first evebt:",first_event)
    return {"event_no": 1, "story": story,"event": event_without_options,"options":options}

@app.post("/end_game/")
async def end_game(request: Request):
    player_state = request.state.user_state
   # print(player_state)
    if player_state["event"] != 0:
        player_state["event"] = 0  
        player_state["multiplier"] = 0  
        player_state["conversation_history"] = []  
        player_state["correct_options"] = ""
        player_state["current_choice"] = ""
        return {
        "details": "ended game unconditionally"
        }
    else:
        return {
        "details": "No game is ongoing"
        }
    

@app.post("/next_event/")
async def next_event(request: Request,user_input: UserInput):
    player_state = request.state.user_state
    # Get the player's choice for the current event
    choice = user_input.choice.upper()
    # Check the event number and make decisions accordingly
    current_event = player_state["event"]
    player_state["current_choice"] = choice
    if current_event == 1:
        return await handle_event(request,choice, 2, 0)
    elif current_event == 2:
        return await handle_event(request,choice, 3, 0.5)
    elif current_event == 3:
        return await handle_event(request,choice, "end", 2)
    elif current_event == 0:
        raise HTTPException(status_code=400,detail="Please start a game")
    else:
        raise HTTPException(status_code=400, detail="Game already completed.")

# Helper function to handle the game events and manage game state
async def handle_event(request: Request,choice, next_event_no, score_multipliers):
    player_state = request.state.user_state
    current_event = player_state["event"]
    conversation_history = player_state["conversation_history"]
    crr_options = player_state["correct_options"]
    event_req= os.environ.get(f"event{current_event}_req")
    check = check_choice(choice,crr_options)
    #final event
    if next_event_no == "end":
        
        if check:
            event_end= os.environ.get(f"event{current_event}_good_end")
            conversation_history.append({"role": "user", "content": f"User choose option {choice} {event_end}"})
            
            #logging.basicConfig(filename='output.log', level=logging.INFO)
           # logging.info(f'{player_state["conversation_history"]}')
            chat_completion_event3 = client.chat.completions.create(
                messages=conversation_history,
                model="llama3-8b-8192",
            )
            ending = chat_completion_event3.choices[0].message.content
            player_state["event"] = 0  # Reset event for future games
            player_state["multiplier"] = 0  # Assign multiplier for success
            player_state["conversation_history"] = [] 
            player_state["correct_options"] = ""
            player_state["current_choice"] = ""
            return {"game_completed": True, "multiplier": score_multipliers, "conclusion": ending,"game_end":"pass"}
        else:
            event_end= os.environ.get(f"event{current_event}_bad_end")
            conversation_history.append({"role": "user", "content": f"User choose option {choice} {event_end}"})
           # logging.basicConfig(filename='output.log', level=logging.INFO)

            #logging.info(f'{player_state["conversation_history"]}')
            chat_completion_event3 = client.chat.completions.create(
                messages=conversation_history,
                model="llama3-8b-8192",
            )
            wrong_ending = chat_completion_event3.choices[0].message.content
            player_state["event"] = 0  # Reset event for future games
            player_state["multiplier"] = 0  # Assign multiplier for success
            player_state["conversation_history"] = [] 
            player_state["correct_options"] = ""
            player_state["current_choice"] = ""
            return {"game_completed": True, "multiplier": score_multipliers, "conclusion": wrong_ending,"game_end":"fail"}
   
    # right choice scenario forwards to next event 
    if check:
        advance= os.environ.get(f"advance_{next_event_no}")
       # print(advance)
       
        conversation_history.append({"role": "user", "content": f"User choose option {choice} {advance}"})
       
        chat_completion_event = client.chat.completions.create(
            messages=conversation_history,
            model="llama3-8b-8192",
        )
        to_next = chat_completion_event.choices[0].message.content
        #print(to_next)
        next_event_req= os.environ.get(f"event{next_event_no}_req")
        conversation_history.append({"role": "assistant", "content": f"{to_next}"})
        conversation_history.append({"role": "user", "content": f"{next_event_req}"})
        chat_completion_event = client.chat.completions.create(
            messages=conversation_history,
            model="llama3-8b-8192",
        )
        player_state["event"] = next_event_no
        player_state["multiplier"] = score_multipliers
        next_event = chat_completion_event.choices[0].message.content
        logging.basicConfig(filename='output.log', level=logging.INFO)
        logging.info(f'{player_state["conversation_history"]}')
        event_options = next_event.split("\n")
        options = [text for text in event_options if text.startswith("Option")]
        print(options)
        event_parts = next_event.split("Option")
        # The first part contains the main event description
        next_event_without_options = event_parts[0].strip()

        # also get new correct options
        conversation_history.append(
        {"role": "assistant", "content":  next_event})
        if next_event_no ==3:
             conversation_history.append({"role": "user", "content": f"Give the correct option for event {next_event_no} in python list format eg.[A,B,C]. (do not mention anything else only give as asked)"})
        else:
            conversation_history.append({"role": "user", "content": f"Give the correct options for event {next_event_no} in python list format eg.[A,B,C]. (do not mention anything else only give as asked)"})
        chat_completion_event_options = client.chat.completions.create(
                messages=conversation_history,
                model="llama3-8b-8192",
            )
        event_crr_options = chat_completion_event_options.choices[0].message.content
        player_state["correct_options"] = event_crr_options
        player_state["conversation_history"] = conversation_history
        return {"game_completed": False,"event_no":next_event_no,"event": next_event_without_options, "story": to_next,"options":options}
        #print(next_event)
    else:
        event_end= os.environ.get(f"event{current_event}_end")
        conversation_history.append({"role": "user", "content": f"User chooses option {choice} {event_end}"})
        chat_completion_event = client.chat.completions.create(
            messages=conversation_history,
            model="llama3-8b-8192",
        )
        ending = chat_completion_event.choices[0].message.content
        logging.basicConfig(filename='output.log', level=logging.INFO)
        logging.info(f'{player_state["conversation_history"]}')
        player_state["event"] = 0  # Reset event for future games
        player_state["multiplier"] = score_multipliers  # Assign multiplier for success
        player_state["conversation_history"] = [] 
        player_state["correct_options"] = ""
        player_state["current_choice"] = ""
        return {"game_completed": True, "multiplier": score_multipliers, "conclusion": ending,"game_end":"fail"}

















