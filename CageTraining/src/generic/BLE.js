import Utils from './Utils';

export default class BLE {

  constructor() {
    this.state = {

      // Name of BLE device
      name: "BLENano_Bo",
      namePrefix: "BLENano_",

      // Unique identified for commands, must match BLE code
      serviceUUID:       0xFFFF,
      customserviceUUID: 0xA000,
      connectionUUID:    0xA001,
      pumpdurationUUID:  0xA002,

      // Device information will be stored here
      device: [],
      server: [],
      service: [],
      pingcommand: [],
      pumpcommand: [],
      connected: false,

      // Setting for pinging
      ping_duration: 199,
      ping_interval: 5000,
    }

    // Bind functions to class:
    this.ping = this.ping.bind(this);
    this.connect = this.connect.bind(this);
    this.reconnect = this.reconnect.bind(this);
    this.__findDevice = this.__findDevice.bind(this);
    this.__connectDevice = this.__connectDevice.bind(this);

    // Connect to device:
    this.connect();
  }

  async __findDevice() {
    let result = Promise.resolve()
    if(!this.state.connected) {
      let options = {filters: [
        {namePrefix: this.state.namePrefix},
        {services: [this.state.customserviceUUID]}
      ]}

      try {
        let device = await navigator.bluetooth.requestDevice(options);
        device.addEventListener('gattserverdisconnected', this.reconnect);
        this.state.device = device;
      }
      catch(err) {
        console.log('Device not found: ', err)
      }
    }
    return result
  }

  async __connectDevice() {

    // Connect to server
    let server = await this.state.device.gatt.connect()
    this.state.server = server

    // Get service
    let service = await server.getPrimaryService(this.state.customserviceUUID)
    this.state.service = service

    // Get device characteristics
    let characteristics = await Promise.all([
        service.getCharacteristic(this.state.connectionUUID),
        service.getCharacteristic(this.state.pumpdurationUUID)])
    this.state.pingcommand = characteristics[0]
    this.state.pumpcommand = characteristics[1]

    // We are now connected; start pinging
    this.state.connected = true
    this.ping();
  }

  async connect() {
    try {
      console.log('Finding device.')
      await this.__findDevice();
      console.log('Device found, now connecting...')
      await this.__connectDevice();
      console.log('Device connected.')
    }
    catch(err) {
      console.log('Connection error: ', err);
    }
  }

  reconnect() {
    console.log('TODO');
  }

  ping() {
    console.log('Pinging device')
    if(this.state.connected) {
      var arrInt8 = Utils.toBytesInt16(this.state.ping_duration);
      this.state.pingcommand.writeValue(arrInt8);
      let self = this;
      let pingTimer = setTimeout(function() {
        clearTimeout(pingTimer);
        self.ping();
      }, this.state.ping_interval);  // this makes sure we ping forever
    }
  }

  async pump(duration) {
    if(this.state.connected) {
      var arrInt8 = Utils.toBytesInt16(duration);
      try {
        console.log('Pumping', duration);
        await this.state.pumpcommand.writeValue(arrInt8);
      }
      catch(err) {
        console.log('Pump error: ', err);
      }
    }
  }
}
