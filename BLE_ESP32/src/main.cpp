#include <Arduino.h>
#include <Adafruit_Sensor.h>
/* 
 *  Programa baseado no programa original desenvolvido por Timothy Woo 
 *  Tutorial do projeto original; https://www.hackster.io/botletics/esp32-ble-android-arduino-ide-awesome-81c67d
 *  Modificado para ler dados do sensor DHT11 - Bluetooth Low Energy com ESP32
 */
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#include "DHT.h"

#include "mbedtls/aes.h"

#include <iostream>
#include <string>

BLECharacteristic *pCharacteristic;

bool deviceConnected = false;
const int LED = 12; // Could be different depending on the dev board. I used the DOIT ESP32 dev board.

#define DHTPIN 13
#define DHTTYPE DHT11

int humidity = 11;
int temperature = 22;

char str[16];

int testKey = 2678;
int keySend = 3456;

char *key = "abcdefghijklmnop";

unsigned char cipherTextOutput[16];

// Veja o link seguinte se quiser gerar seus próprios UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID "6E400001-B5A3-F393-E0A9-E50E24DCCA9E" // UART service UUID
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define DHTDATA_CHAR_UUID "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

DHT dht(DHTPIN, DHTTYPE);

int descode(int valor, int keysend, int testKey)
{
  return valor/testKey - keysend;
}

class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    deviceConnected = true;
  };

  void onDisconnect(BLEServer *pServer)
  {
    deviceConnected = false;
  }
};

class MyCallbacks : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  {
    std::string rxValue = pCharacteristic->getValue();
    std::string newString;

    if (rxValue.length() > 0)
    {
      Serial.println("*********");
      Serial.print("Received Value: ");

      for (int i = 0; i < rxValue.length(); i++)
      {
        Serial.print(rxValue[i]);
      }
      Serial.println();
      Serial.println("*********");
    }

    Serial.print("Valor convertido");
    Serial.println(atoi( rxValue.c_str() ));
    Serial.println(descode(atoi( rxValue.c_str()), keySend, testKey ));


    // Processa o caracter recebido do aplicativo. Se for A acende o LED. B apaga o LED
    if (!descode(atoi( rxValue.c_str()), keySend, testKey ))
    {
      Serial.println("Turning OFF!");
      digitalWrite(LED, LOW);
    }
    else if (descode(atoi( rxValue.c_str()), keySend, testKey ))
    {
      Serial.println("Turning ON!");
      digitalWrite(LED, HIGH);
    }
  }
};


void setup()
{
  Serial.begin(115200);

  dht.begin();

  pinMode(LED, OUTPUT);

  // Create the BLE Device
  BLEDevice::init("ESP32"); // Give it a name

  // Configura o dispositivo como Servidor BLE
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Cria o servico UART
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Cria uma Característica BLE para envio dos dados
  pCharacteristic = pService->createCharacteristic(
      DHTDATA_CHAR_UUID,
      BLECharacteristic::PROPERTY_NOTIFY);

  pCharacteristic->addDescriptor(new BLE2902());

  // cria uma característica BLE para recebimento dos dados
  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
      CHARACTERISTIC_UUID_RX,
      BLECharacteristic::PROPERTY_WRITE);

  pCharacteristic->setCallbacks(new MyCallbacks());

  // Inicia o serviço
  pService->start();

  // Inicia a descoberta do ESP32
  pServer->getAdvertising()->start();
  Serial.println("Esperando um cliente se conectar...");

  humidity = dht.readHumidity();

  temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature))
  {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  Serial.print("Umidade: ");
  Serial.print(humidity);
  Serial.print(" %\t");
  Serial.print("Temperatura: ");
  Serial.print(temperature);
  Serial.println(" *C");

  // char humidityString[2];
  // char temperatureString[2];
  // dtostrf(humidity, 1, 2, humidityString);
  // dtostrf(temperature, 1, 2, temperatureString);

  // char dhtDataString[16];
  // sprintf(dhtDataString, "%d,%d", temperature, humidity);

  // encrypt(dhtDataString, key, cipherTextOutput);

  // Serial.print("Valor cripoooo ");
  // for (int i = 0; i < 16; i++)
  // {

  //   char str[3];

  //   sprintf(str, "%02x", (int)cipherTextOutput[i]);
  //   Serial.print(str);
  // }
}

void loop()
{
  if (deviceConnected)
  {

    humidity = (int)dht.readHumidity();
    temperature = (int)dht.readTemperature();
    // testa se retorno é valido, caso contrário algo está errado.
    if (isnan(temperature) || isnan(humidity))
    {
      Serial.println("Failed to read from DHT");
    }
    else
    {
      Serial.print("Umidade: ");
      Serial.print(humidity);
      Serial.print(" %\t");
      Serial.print("Temperatura: ");
      Serial.print(temperature);
      Serial.println(" *C");
    }

    humidity = (humidity * testKey);
    temperature = (temperature * testKey);

    char humidityString[2];
    char temperatureString[2];
    dtostrf(humidity, 1, 2, humidityString);
    dtostrf(temperature, 1, 2, temperatureString);

    char dhtDataString[16];
    sprintf(dhtDataString, "%d,%d", temperature, humidity);

    Serial.println("Valor do dhData");
    Serial.println(dhtDataString);
 

  pCharacteristic->setValue(dhtDataString);

  pCharacteristic->notify(); // Envia o valor para o aplicativo!
  Serial.print("*** Dado enviado: ");
  Serial.print(str);
  Serial.println(" ***");
}
delay(5000);
}