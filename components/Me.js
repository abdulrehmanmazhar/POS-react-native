import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axiosInstance from '../utils/axiosInstance';

const Me = ({ handleLogout }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get('/me');
        setUser(response.data.user);
      } catch (err) {
        setError('Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Name: {user.name}</Text>
          <Text style={styles.userEmail}>Email: {user.email}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Me;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
  },
  userInfo: {
    marginBottom: 20,
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  userEmail: {
    fontSize: 16,
    color: '#555',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
  },
});
