import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Switch,
  Platform,
  Button,
  Image
} from 'react-native';
import { BleManager } from "react-native-ble-plx"
import { Buffer } from "buffer"
import { Dimensions } from 'react-native'



export default class BlePage extends React.Component {
  constructor() {
    super()
    this.manager = new BleManager()
    this.state = {
      isLoading: false,
      myDevice: '',
      stateLed: false,
      info: "",
      temperature: "",
      humidity: "",
    };
    this.deviceprefix = "Device";
    this.devicesuffix_dx = "DX";
    this.sensors = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E" //: "TempHu"


  }

  serviceUUID() {
    return "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
  }

  notifyUUID(num) {
    return num //"6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
  }

  model_dx(model) {
    return this.deviceprefix + model + this.devicesuffix_dx
  }

  info(message) {
    this.setState({ info: message })
  }

  error(message) {
    this.setState({ info: "ERROR: " + message })
  }

  updateValue(key, value) {
    this.setState({ values: { ...this.state.values, [key]: value } })
  }


  componentDidMount() {
    // if (Platform.OS === 'ios') {
    //   console.log("Estou no IOS")
    //   this.manager.onStateChange((state) => {
    //     if (state === 'PoweredOn') this.scanAndConnect()
    //   })
    // } else {
    //   this.scanAndConnect()
    // }

    const subscription = this.manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        this.scanAndConnect();
        subscription.remove();
      }
    }, true);

  }

  async requestPermission() {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.setState({ permissionStatus: 'granted' });
      } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
        this.setState({ permissionStatus: 'denied' });
      } else {

      }
    } catch (err) {
      console.error(err)
    }
  }

  scanAndConnect() {
    const BLE_DEVICE_NAME = "ESP32"

    this.manager.startDeviceScan(null, null, (error, device) => {
      console.log("Scanning...")
      console.log(device)




      if (error) {
        console.log("Estou no ERROOOO")
        console.log(error.message)
        return
      }

      this.setState({
        myDevice: device,

      });

      if (device.name == BLE_DEVICE_NAME) {
        console.log("Connecting to device");
        this.manager.stopDeviceScan();

        device.connect()
          .then((device) => {
            console.log("Discovering services and characterstics")
            return device.discoverAllServicesAndCharacteristics()
          })
          .then((device) => {
            console.log("Setting notifications")
            return this.setupNotifications(device)

            // device.monitorCharacteristicForService('6E400001-B5A3-F393-E0A9-E50E24DCCA9E', '6E400003-B5A3-F393-E0A9-E50E24DCCA9E')
            //   .then((characteristic) => {

            //     console.log(base64.decode(characteristic.value));
            //     console.log(characteristic);

            //     return
            //   }).catch((error) => {
            //     // Handle errors
            //     console.log(error.message)
            //   });



          })







        // device.connect()
        //   .then((device) => {
        //     console.log("Discovering services and characterstics")
        //     return device.discoverAllServicesAndCharacteristics()
        //   })
        //   .then((device) => {
        //     console.log("Setting notifications")

        //     device.writeCharacteristicWithResponseForService('6E400001-B5A3-F393-E0A9-E50E24DCCA9E', '6E400002-B5A3-F393-E0A9-E50E24DCCA9E', 'aGVsbG8gbWlzcyB0YXBweQ==')
        //       .then((characteristic) => {
        //         console.log(characteristic.value);
        //         return
        //       })
        //   })
        //   .catch((error) => {
        //     console.log(error.message)
        //   })





      }
    })



    // this.manager.startDeviceScan(null, null, (error, device) => {
    //   console.log("Scanning...")
    //   console.log(device)
    //   if(error) {
    //     console.log("Estou no ERROOOO")
    //     console.log(error.message)
    //     return
    //   }

    //   if (device.name == BLE_DEVICE_NAME) {
    //     console.log("Connecting to device")
    //     this.manager.stopDeviceScan()
    //     device.connect()
    //       .then((device) => { 
    //          console.log("Discovering services and characterstics")
    //          return device.discoverAllServicesAndCharacteristics()
    //       })
    //       .then((device) => {
    //         console.log("Setting notifications")

    //       })
    //       .then(() => { 
    //           console.log("Listening...")
    //       }, (error) => {
    //           console.log(error.message)
    //       })
    //   }
    // })

  }

  async setupNotifications(device) {


    const service = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
    const characteristicN = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E" //this.notifyUUID(id)

    device.monitorCharacteristicForService(service, characteristicN, (error, characteristic) => {
      if (error) {
        this.error(error.message)
        return
      }
      this.updateValue(characteristic.uuid, characteristic.value)
      console.log(Buffer.from(characteristic.value, 'base64').toString('ascii'))

      var valuesString = Buffer.from(characteristic.value, 'base64').toString('ascii')

      var splitValues = valuesString.split(',')
      console.log("Valores recebidos")
      console.log(splitValues[0])
      this.setState({
        temperature: splitValues[0]
      })
      console.log(splitValues[1])
      this.setState({
        humidity: splitValues[1]
      })

    })



    console.log("Estou para receber")






  }





  onoff() {

    const device = this.state.myDevice;
    //var stateLed = false;

    if (this.state.stateLed == true) {
      this.setState({
        stateLed: false
      })
      this.manager.writeCharacteristicWithResponseForDevice(device.id, '6E400001-B5A3-F393-E0A9-E50E24DCCA9E', '6E400002-B5A3-F393-E0A9-E50E24DCCA9E', 'MA==')
        .then((characteristic) => {
          console.log(characteristic.value);
          return
        })

        .catch((error) => {
          console.log(error.message)
        })
    } else {
      this.setState({
        stateLed: true
      })
      this.manager.writeCharacteristicWithResponseForDevice(device.id, '6E400001-B5A3-F393-E0A9-E50E24DCCA9E', '6E400002-B5A3-F393-E0A9-E50E24DCCA9E', 'MQ==')
        .then((characteristic) => {
          console.log(characteristic.value);
          return
        })

        .catch((error) => {
          console.log(error.message)
        })
    }



  }

  renderButton() {
    if (this.state.isLoading)
      return <ActivityIndicator size="large" style={styles.loading} />;

    return (
      <View>

        <View style={styles.btn}>
          <Button
            title='BOMBA ON/OFF'
            color='#808080'
            onPress={() => this.onoff()}
          />
        </View>


      </View>
    )
  }
  render() {
    const isLoggedIn = this.state.stateLed;
    var temp = this.state.temperature;
    var umi = this.state.humidity;
    console.log("Valor umidade")
    console.log(umi)
    return (



      <View style={styles.container}>
        {/* <ImageBackground */}
        {/* source={require('../img/logo.png')}
          style={styles.bgImage}
          resizeMode="cover"> */}

        {/* <View style={[styles.section, styles.sectionLarge]}>
            <Text>BluePage</Text>
          </View> */}
        {/* <View
          style={styles.green}
          source={require('../img/greenTest.png')}
        >
          <Text>BluePage</Text>

        </View> */}

        {/* <View style={{ position: 'absolute', top:50 , left: 0, height: 400, width: 400, }}>
          <Text
            style={{ fontSize: 20, color: 'white', backgroundColor: 'red', alignItems: 'center',justifyContent: 'center' }}>
            Flat 50%
            </Text>
        </View> */}
        {/* <View style={{justifyContent: 'center',   marginTop: 0}}>
          <Image
            style={{
              //flex: 1,
              width: 175,
              height: 80,
              right: 1,

            }}
            source={require('../img/ur.png')}
          />
          <Text style={{ fontWeight: "bold", color: 'white', position: 'absolute', fontSize: 40 }}>  65%</Text>
          </View>
          <View style={{justifyContent: 'center',   marginTop: 0}}>
          <Image
            style={{
              //flex: 1,
              width: 175,
              height: 80,
              
            }}
            source={require('../img/ur.png')}
          />
          <Text style={{ fontWeight: "bold", color: 'white', position: 'absolute', fontSize: 40 }}>65%</Text>
        </View> */}

        <View style={styles.imageContainer}>


          <Image resizeMode='contain'
            style={{ width: Dimensions.get('window').width / 2, height: Dimensions.get('window').width / 2 }}
            source={require("../img/ur.png")} />

          <Text style={{ fontWeight: "bold", color: 'white', position: 'absolute', fontSize: 40 }}>  {umi}% </Text>


          <Image resizeMode='contain'
            style={{ width: Dimensions.get('window').width / 2, height: Dimensions.get('window').width / 2 }}
            source={require("../img/temp.png")} />

          <Text style={{ fontWeight: "bold", color: 'white', position: 'absolute', fontSize: 40 }}>                     {temp} C</Text>



        </View>

        {/* <View style={{padding: 10}}> */}
        {/* <View> */}


        {/* </View> */}

        {/* </View> */}


        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 0 }}>
          <Image
            style={{
              // flex: 1,
              width: 500,
              height: 30,

            }}
            source={require('../img/gray.png')}
          />
          <Text style={{ color: 'white', position: 'absolute', fontSize: 20 }}>Status Bomba</Text>
        </View>


        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 0 }}>
          <Image
            style={{
              // flex: 1,
              width: 500,
              height: 100,
            }}
            source={require('../img/greenTest.png')}
          />
          <Text style={{ color: 'white', position: 'absolute', justifyContent: 'center', alignItems: 'center', fontSize: 40 }}>Bomba {isLoggedIn ? 'Ligada' : 'Desligada'}</Text>
        </View>



        {this.renderButton()}
        {/* </ImageBackground> */}





      </View>

    );
  }


}




const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // alignItems: 'center',
    // justifyContent: 'space-around',
    // flexDirection: 'row',
    // paddingRight: 10,
    // paddingLeft: 10,
    backgroundColor: '#d1cfd8',
    height: "100%",
    width: "100%"

  },
  bgImage: {
    flex: 1,
    marginHorizontal: -20,
  },
  txtPoint: {
    color: 'white',
    fontSize: 80,
  },
  section: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLarge: {
    flex: 4,
    justifyContent: 'space-around',
  },
  btn: {
    paddingTop: 20,
    fontSize: 11,
  },
  loading: {
    padding: 20,
  },
  green: {
    position: 'absolute',
    top: 100,
    left: 200,
    width: 400,
    height: 100
  },
  imageContainer: {
    //flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    //alignItems: 'center',
    marginTop: -40,
    marginBottom: -40,
    //position: 'absolute'
  }

});