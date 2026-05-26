import time
import json
import serial
import requests

# ══════════════════════════════════════════════════════════════════════════════
#  JSON SERIAL TO HTTP FORWARDER FOR ARDUINO MEGA
# ══════════════════════════════════════════════════════════════════════════════
#
# This script is custom-tailored for your Arduino Mega code which outputs 
# JSON data over USB Serial in the format:
#   {"distance": 10.50, "waterLevel": 3.50, "status": "SAFE"}
#
# The script parses this serial JSON and forwards it to the FastAPI Server.
#
# ══════════════════════════════════════════════════════════════════════════════

# 1. 🔌 Serial Configuration
# Change 'COM3' to the COM port your Arduino Mega is connected to (e.g., 'COM4', 'COM5').
# On Mac/Linux, this will look like '/dev/tty.usbmodemXXXX' or '/dev/ttyACM0'.
SERIAL_PORT = 'COM7' 
BAUD_RATE = 9600

# 2. 📡 Server Configuration
# If the Arduino is connected to a DIFFERENT laptop:
#   -> Change 'localhost' to the local IP address of your server laptop (e.g., '192.168.1.150').
# If the Arduino is plugged DIRECTLY into the server laptop:
#   -> Keep 'localhost'.
SERVER_URL = "http://localhost:8001/api/iot/reading/"
API_KEY = "flood-iot-secret-2026"

# 3. 🌊 Location Configuration
LOCATION_NAME = "Cagayan De Oro River"

def map_status(arduino_status):
    """
    Maps the Arduino's status string to what the FastAPI backend expects:
      "SAFE"    -> "Normal"
      "WARNING" -> "Warning"
      "DANGER"  -> "Danger"
    """
    status_upper = str(arduino_status).strip().upper()
    if status_upper == "SAFE":
        return "Normal"
    elif status_upper == "WARNING":
        return "Warning"
    elif status_upper == "DANGER":
        return "Danger"
    return "Normal" # Fallback default

def main():
    print(f"Connecting to Arduino Mega on {SERIAL_PORT}...")
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=2)
        time.sleep(2) # Give the Arduino Mega 2 seconds to reset after connection
        print("[+] Connected successfully! Listening for JSON sensor data...")
    except Exception as e:
        print(f"[ERROR] Could not open serial port {SERIAL_PORT}. Details: {e}")
        print("[TIP] Make sure the Arduino IDE Serial Monitor is CLOSED before running this script!")
        return

    last_level = None

    while True:
        try:
            if ser.in_waiting > 0:
                # Read the line printed by Arduino Mega (e.g. '{"distance": 10.50, "waterLevel": 3.50, "status": "SAFE"}\r\n')
                raw_line = ser.readline().decode('utf-8', errors='ignore').strip()
                if not raw_line:
                    continue
                
                # Skip the startup message if printed
                if "FLOOD MONITORING SYSTEM STARTED" in raw_line:
                    print("[!] Arduino Mega started up!")
                    continue
                
                print(f"[Serial] Arduino Serial: {raw_line}")
                
                # Parse the JSON string
                try:
                    arduino_data = json.loads(raw_line)
                except json.JSONDecodeError:
                    # Ignore malformed/partial JSON buffers
                    continue

                # Extract variables
                current_level = float(arduino_data.get("waterLevel", 0.0))
                arduino_status = arduino_data.get("status", "SAFE")
                
                # Map safety status
                status = map_status(arduino_status)

                # Determine trend
                trend = "Steady"
                if last_level is not None:
                    if current_level > last_level + 0.05:
                        trend = "Rising"
                    elif current_level < last_level - 0.05:
                        trend = "Falling"
                last_level = current_level

                # Build the JSON payload for FastAPI
                payload = {
                    "location_name": LOCATION_NAME,
                    "current_level": current_level,
                    "status": status,
                    "trend": trend,
                    "api_key": API_KEY
                }

                # Forward to FastAPI Server
                print(f"[Forwarding] Forwarding to server -> Level: {current_level}m, Status: {status}, Trend: {trend}...")
                headers = {"Content-Type": "application/json"}
                response = requests.post(SERVER_URL, json=payload, headers=headers)

                if response.status_code == 201:
                    print(f"[SUCCESS] Server logged: {response.json()}")
                else:
                    print(f"[SERVER ERROR] ({response.status_code}): {response.text}")

        except KeyboardInterrupt:
            print("\nShutting down forwarder...")
            ser.close()
            break
        except Exception as e:
            print(f"[ERROR] Error reading/forwarding data: {e}")
            time.sleep(2)

        time.sleep(0.1)

if __name__ == '__main__':
    main()
