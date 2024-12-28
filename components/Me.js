import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AsyncStorage } from 'react-native';

// const handleLogout = async () => {
//     await AsyncStorage.removeItem('accessToken');
//     setIsAuthenticated(false);
// };

const Me = ({handleLogout}) => (
    <View style={styles.screen}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
    </View>
);

export default Me;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f7f8fa',
      padding: 20,
      paddingTop: 40
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
    logoutButton: {
      backgroundColor: '#FF3B30',
      padding: 15,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 10,
    },
    logoutButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '500',
    },
    screen: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f7f8fa',
    },
    screenText: {
      fontSize: 18,
      fontWeight: '500',
    },
});
