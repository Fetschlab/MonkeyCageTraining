#include "ble/BLE.h"
Gap::ConnectionParams_t fast;

// For pin definitions, consult https://developer.mbed.org/users/mbed_official/code/mbed-src/file/a11c0372f0ba/targets/hal/TARGET_NORDIC/TARGET_MCU_NRF51822/TARGET_RBLAB_BLENANO

// Pins connected on the device
DigitalOut ledpump(P0_19, 1);   // pin 19: D13 (LED on device)
DigitalOut ledping(P0_19, 1);   // pin 19: D13 (LED on device)
DigitalOut pumpon(P0_28, 1);    // pin 28: D4

// Unique identified for the various messages exchanges
uint16_t customServiceUUID          = 0xA000;  // Service
uint16_t writeUUID_connectionstatus = 0xA001;  // Characteristic for connection status (write this value from Javascript)
uint16_t writeUUID_pumpduration     = 0xA002;  // Characteristic for pump on duration (write this value from Javascript)

// Set device name
const static char     DEVICE_NAME[] = "BLENano_Bo";
static const uint16_t uuid16_list[] = {0xFFFF}; // Custom UUID, FFFF is reserved for development

// Connection Status (1 bit write)
static uint8_t connectionStatusValue[2] = {0};
GattCharacteristic writeConnectionStatusChar(writeUUID_connectionstatus,
  connectionStatusValue,sizeof(connectionStatusValue),sizeof(connectionStatusValue),
  GattCharacteristic::GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_WRITE_WITHOUT_RESPONSE);

// Pump Duration (write)
static uint8_t pumpDurationValue[2] = {0};
GattCharacteristic writePumpDurationChar(writeUUID_pumpduration,
  pumpDurationValue,sizeof(pumpDurationValue),sizeof(pumpDurationValue),
  GattCharacteristic::GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_WRITE_WITHOUT_RESPONSE);

// Set up characteristics for GATT
GattCharacteristic *characteristics[] = {
    &writeConnectionStatusChar,
    &writePumpDurationChar,
};
GattService customService(customServiceUUID, characteristics, sizeof(characteristics) / sizeof(GattCharacteristic *));

// Callback function: this gets executed whenever we receive a message
void messageReceivedCallback(const GattWriteCallbackParams *params) {
  
    // Only respond to pump and ping commands
    if(params->handle == writePumpDurationChar.getValueHandle() | params->handle == writeConnectionStatusChar.getValueHandle()) {

        // Get duration from command
        short* pdatashort = (short*) params->data;
        float duration = ((float) *pdatashort / 1000.);
        //printf("data in pointer: %d\n\r", *pdatashort);  
        printf("duration: %d\n\r", int(duration * 1000));

        // Execute the pump command
        if (params->handle == writePumpDurationChar.getValueHandle()) {
            printf("Trigger pump\n\r");
            ledpump = 0;  // onboard LED has reverse logic
            pumpon  = 1;            
            wait(duration);
            pumpon  = 0;
            ledpump = 1;  // onboard LED has reverse logic
        }

        // Blink LED whenever we receive ping
        if (params->handle == writeConnectionStatusChar.getValueHandle()) {
            printf("Received ping\n\r");
            ledping = 0;  // onboard LED has reverse logic
            wait(duration);
            ledping = 1;
        }
    }
}
 
// Callback that is executed when connection lost: make BLE available for pairing
void disconnectionCallback(const Gap::DisconnectionCallbackParams_t *) {
    BLE::Instance(BLE::DEFAULT_INSTANCE).gap().startAdvertising();
}

// Callback that is executed when device is ready: setup other callbacks, start advertising
void bleInitComplete(BLE::InitializationCompleteCallbackContext *params) {

    // Get the BLE object
    BLE &ble          = params->ble;
    ble_error_t error = params->error;
    if (error != BLE_ERROR_NONE) {
        return;
    }

    // Set up the callbacks
    ble.gap().onDisconnection(disconnectionCallback);
    ble.gattServer().onDataWritten(messageReceivedCallback);

    // Set up advertising type, name of device, and characteristics (visible to devices trying to pair)
    ble.gap().accumulateAdvertisingPayload(GapAdvertisingData::BREDR_NOT_SUPPORTED | GapAdvertisingData::LE_GENERAL_DISCOVERABLE); // BLE only, no classic BT
    ble.gap().setAdvertisingType(GapAdvertisingParams::ADV_CONNECTABLE_UNDIRECTED); // advertising type
    ble.gap().accumulateAdvertisingPayload(GapAdvertisingData::COMPLETE_LOCAL_NAME, (uint8_t*) DEVICE_NAME, sizeof(DEVICE_NAME)); // device name
    ble.gap().accumulateAdvertisingPayload(GapAdvertisingData::COMPLETE_LIST_16BIT_SERVICE_IDS, (uint8_t*) uuid16_list, sizeof(uuid16_list)); // UUID's broadcast in advertising packet
    ble.gap().setAdvertisingInterval(25);
    
    // Connection parameter suggetions that are controlled by the client
    ble.getPreferredConnectionParams(&fast);
    fast.minConnectionInterval = 8;
    fast.maxConnectionInterval = 16;
    fast.slaveLatency = 0;
    ble.setPreferredConnectionParams(&fast);

    // Add our custom service
    ble.addService(customService);

    // Start advertising: this makes the device available for pairing
    ble.gap().startAdvertising();
}

// Main program
int main(void) {

    // Set up BLE
    printf("Starting BLE Device: %s\n\r", DEVICE_NAME);        
    BLE& ble = BLE::Instance(BLE::DEFAULT_INSTANCE);
    ble.init(bleInitComplete);

    // Base state of LEDs and pump
    ledpump = 1;  // onboard LED has reverse logic
    ledping = 1;  // onboard LED has reverse logic
    pumpon  = 0;
    
    // Wait until device is initialized
    while(ble.hasInitialized() == false) {}

    // Infinite loop: wait for events
    while (true) {
       ble.waitForEvent();
    }
}
