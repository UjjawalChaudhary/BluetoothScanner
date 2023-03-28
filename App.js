import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, FlatList } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import * as Permissions from 'expo-permissions';
import { ListItem, Card } from 'react-native-elements';

export default function App() {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [manager, setManager] = useState(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    initBluetooth();
  }, []);

  const initBluetooth = async () => {
    const bluetoothManager = new BleManager();
    setManager(bluetoothManager);

    const { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== 'granted') {
      console.log('Location permission not granted');
      return;
    }

    const enabled = await bluetoothManager.enable();
    setEnabled(enabled);
  };

  const startScanning = async () => {
    if (!enabled) {
      console.log('Bluetooth not enabled');
      return;
    }

    setScanning(true);
    setDevices([]);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
        return;
      }

      setDevices(devices => [...devices, device]);
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

  return (
    <View style={styles.container}>
      <Button
        title={scanning ? 'Scanning...' : 'Scan Nearby Devices'}
        disabled={scanning}
        onPress={startScanning}
      />
      <FlatList
        data={devices}
        keyExtractor={device => device.id}
        renderItem={({ item }) => (
          <Card>
            <ListItem
              title={item.name ? item.name : 'Unknown Device'}
              subtitle={`MAC Address: ${item.id}, Signal Strength: ${item.rssi}`}
            />
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
});
