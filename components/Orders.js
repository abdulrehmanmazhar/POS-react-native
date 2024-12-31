import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import axiosInstance from '../utils/axiosInstance';

const ITEMS_PER_PAGE = 15;



const Orders = () => {
  const [bills, setBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterDate, setFilterDate] = useState('');
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCompleted, setShowCompleted] = useState(false);
  const [userId, setUserId] = useState(null);
  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/me');
      console.log(response)
      setUserId(response.data.user._id);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user data.');
      console.error('Error fetching user data:', error);
    }
  };
  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/get-orders');
      const allOrders = response.data.orders || [];
      const userOrders = allOrders.filter((order) => order.createdBy === userId);
      const filteredOrders = showCompleted
        ? userOrders.filter((order) => order.bill)
        : userOrders.filter((order) => !order.bill);

      setOrders(filteredOrders);
      console.log("createdby", userId)
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch orders.');
      console.error('Error fetching orders:', error);
    }
  };

  const billCreator = async () => {
    try {
      const billArray = [];
      for (let order of orders) {
        const orderValue = order.cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
        try {
          const response = await axiosInstance.get(`/get-customer/${order.customerId}`);
          const customerData = response.data.customer;
          const bill = {
            id: order._id,
            name: customerData.name,
            address: customerData.address,
            contact: customerData.contact,
            billDate: order.updatedAt,
            billLink: order.bill,
            customerId: order.customerId,
            orderValue,
          };
          billArray.push(bill);
        } catch (error) {
          console.error(`Error fetching customer data for order ${order.id}:`, error);
        }
      }
      setBills(billArray);
    } catch (error) {
      Alert.alert('Error', 'Failed to create bills.');
      console.error('Error creating bills:', error);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [userId,showCompleted]);

  useEffect(() => {
    if (orders.length > 0) {
      billCreator();
    }
  }, [orders]);

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const handleSortChange = () => {
    const sortedBills = [...bills].sort((a, b) => {
      return sortDirection === 'asc'
        ? new Date(a.billDate).getTime() - new Date(b.billDate).getTime()
        : new Date(b.billDate).getTime() - new Date(a.billDate).getTime();
    });
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    setBills(sortedBills);
  };

  const filteredBills = bills.filter((bill) => {
    const billDate = new Date(bill.billDate).toISOString().split('T')[0];
    return (
      bill.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!filterDate || billDate === filterDate)
    );
  });

  const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderBillItem = ({ item, index }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{`#${(currentPage - 1) * ITEMS_PER_PAGE + index + 1}`}</Text>
      <Text>ID: {item.id}</Text>
      <Text>Name: {item.name}</Text>
      <Text>Address: {item.address}</Text>
      <Text>Contact: {item.contact}</Text>
      <Text>Order Value: Rs.{item.orderValue}</Text>
      <Text>Date: {new Date(item.billDate).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search by name"
        value={searchQuery}
        onChangeText={handleSearchChange}
      />
      <TouchableOpacity style={styles.button} onPress={handleSortChange}>
        <Text style={styles.buttonText}>
          Sort by Date ({sortDirection === 'asc' ? 'Newest' : 'Oldest'})
        </Text>
      </TouchableOpacity>
      <View style={styles.checkboxContainer}>
  <TouchableOpacity
    style={[
      styles.checkbox,
      { backgroundColor: showCompleted ? '#007BFF' : '#FFF', borderColor: '#000' },
    ]}
    onPress={() => setShowCompleted(!showCompleted)}
  >
    {showCompleted && <View style={styles.checkboxTick} />}
  </TouchableOpacity>
  <Text style={styles.checkboxLabel}>Show Completed</Text>
</View>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchOrders}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
      <FlatList
        data={paginatedBills}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBillItem}
      />
      <View style={styles.pagination}>
        <TouchableOpacity
          style={styles.pageButton}
          disabled={currentPage === 1}
          onPress={handlePrevPage}
        >
          <Text style={styles.buttonText}>Prev</Text>
        </TouchableOpacity>
        <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
        <TouchableOpacity
          style={styles.pageButton}
          disabled={currentPage === totalPages}
          onPress={handleNextPage}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 40 },
  input: { marginBottom: 16, borderWidth: 1, padding: 8, borderRadius: 4 },
  button: { backgroundColor: '#007BFF', padding: 12, borderRadius: 4, marginTop: 8 },
  refreshButton: { backgroundColor: '#28A745', padding: 12, borderRadius: 4, marginTop: 8 },
  buttonText: { color: '#FFF', textAlign: 'center' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  checkboxLabel: { marginLeft: 8, fontSize: 16 },
  card: { padding: 16, borderWidth: 1, borderRadius: 8, marginBottom: 8, backgroundColor: '#FFF' },
  cardTitle: { fontWeight: 'bold', marginBottom: 4 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  pageButton: { backgroundColor: '#6C757D', padding: 12, borderRadius: 4 },
  pageText: { fontSize: 16 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxTick: {
    width: 10,
    height: 10,
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  
});

export default Orders;
