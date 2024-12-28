import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axiosInstance from './utils/axiosInstance';
import Sell from './components/Sell';
import Me from './components/Me';
import Orders from './components/Orders';
import Customer from './components/Customer';
import Expense from './components/Expense';

const Tab = createBottomTabNavigator();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post('/login', { email, password });
      const token = response.data.accessToken;

      await AsyncStorage.setItem('accessToken', token);
      setIsAuthenticated(true);
    } catch (error) {
      alert(error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('accessToken');
    setIsAuthenticated(false);
  };

  // Dynamic padding for large notches (default to 44px for iOS or StatusBar height for Android)
  const dynamicPaddingTop =
    Platform.OS === 'ios' ? 44 : 50;

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: dynamicPaddingTop }]}>
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#f7f8fa' },
          tabBarActiveTintColor: '#007BFF',
          tabBarInactiveTintColor: '#888',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            switch (route.name) {
              case 'Sell':
                iconName = focused ? 'cart' : 'cart-outline';
                break;
              case 'Orders':
                iconName = focused ? 'list' : 'list-outline';
                break;
              case 'Customer':
                iconName = focused ? 'people' : 'people-outline';
                break;
              case 'Expense':
                iconName = focused ? 'wallet' : 'wallet-outline';
                break;
              case 'Me':
                iconName = focused ? 'person' : 'person-outline';
                break;
              default:
                break;
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Sell" component={Sell} />
        <Tab.Screen name="Orders" component={Orders} />
        <Tab.Screen name="Customer" component={Customer} />
        <Tab.Screen name="Expense" component={Expense} />
        <Tab.Screen name="Me">
          {() => <Me handleLogout={handleLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
    padding: 20,
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    backgroundColor: '#fafafa',
    fontSize: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default App;
