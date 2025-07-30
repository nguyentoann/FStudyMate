#!/usr/bin/env python3
import requests
import time
import json
import random

# Configuration
BACKEND_URL = "http://localhost:8080/api"
DEVICE_ID = "ESP32_SIMULATOR"  # You can also use a MAC address format like "C8F09EF783F8"
POLL_INTERVAL = 2  # seconds

# Function to simulate sending IR signals
def simulate_ir_send(command_type, code, bits=32):
    print(f"🔴 IR SIGNAL SENT: {command_type} - Code: {code}, Bits: {bits}")
    return True

# Function to poll for commands
def poll_for_commands():
    try:
        # Poll the backend for commands
        url = f"{BACKEND_URL}/device/{DEVICE_ID}/commands"
        print(f"Polling: {url}")
        
        response = requests.get(url)
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            # Command found
            command = response.json()
            print(f"Command received: {json.dumps(command, indent=2)}")
            
            # Process the command based on type
            if "type" in command:
                command_type = command["type"]
                if command_type == "raw":
                    # Handle raw IR command
                    data = command["code"]
                    simulate_ir_send("RAW", data)
                elif command_type == "samsung":
                    # Handle Samsung IR command
                    code = command["code"]
                    bits = command.get("bits", 32)
                    simulate_ir_send("SAMSUNG", code, bits)
                elif command_type == "nec":
                    # Handle NEC IR command
                    code = command["code"]
                    bits = command.get("bits", 32)
                    simulate_ir_send("NEC", code, bits)
                
                # Acknowledge the command
                ack_url = f"{BACKEND_URL}/device/{DEVICE_ID}/ack/{command['id']}"
                ack_response = requests.post(ack_url, data="")
                print(f"Command acknowledged: {ack_response.status_code}")
                return True
        
        elif response.status_code == 204:
            # No commands available
            print("No commands pending")
        
        else:
            print(f"Error polling for commands: {response.status_code}")
        
        return False
    
    except Exception as e:
        print(f"Error in poll_for_commands: {e}")
        return False

# Function to register device presence
def register_device():
    try:
        # Just poll once to register
        url = f"{BACKEND_URL}/device/{DEVICE_ID}/status"
        response = requests.get(url)
        print(f"Device registration: {response.status_code}")
        return True
    except Exception as e:
        print(f"Error in register_device: {e}")
        return False

# Main function
def main():
    print(f"ESP32 Simulator starting (Device ID: {DEVICE_ID})")
    
    # Register device
    register_device()
    
    try:
        while True:
            # Poll for commands
            poll_for_commands()
            
            # Wait for next poll
            time.sleep(POLL_INTERVAL)
    
    except KeyboardInterrupt:
        print("\nESP32 Simulator stopping")

if __name__ == "__main__":
    main() 