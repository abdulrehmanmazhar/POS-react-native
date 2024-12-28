import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import { Picker } from '@react-native-picker/picker';


const Sell = () => {
  const [updation, setUpdation] = useState('');
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');

  const [currentProduct, setCurrentProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [addedItems, setAddedItems] = useState([]);
  const [orderId, setOrderId] = useState();

  const [payment, setPayment] = useState(0);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await axiosInstance.get('/get-customers');
      setCustomers(data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert('Error', 'Failed to fetch customers');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axiosInstance.get('/get-products');
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
    }
  };

  const handleAddItem = async () => {
    if (currentProduct && quantity > 0 && selectedCustomer) {
      const selectedProduct = products.find((p) => p._id === currentProduct);

      if (selectedProduct) {
        try {
          const response = await axiosInstance.post(
            `/fill-cart/${selectedCustomer}`,
            { productId: selectedProduct._id, qty: quantity }
          );

          if (response.status === 200) {
            const { order } = response.data;
            setOrderId(order._id);
            syncCart(order);

            setCurrentProduct(null);
            setQuantity(1);
          }
        } catch (error) {
          console.error('Error adding item to cart:', error);
          Alert.alert('Error', 'Failed to add item to cart');
        }
      }
    } else {
      Alert.alert('Error', 'Please select a customer, product, and valid quantity.');
    }
  };

  const syncCart = async (order) => {
    try {
      const { data } = await axiosInstance.get(`/get-order/${order._id}`);
      setAddedItems(data.order.cart);
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  };

  const handleDeleteItem = async (index) => {
    try {
      await axiosInstance.delete(`/delete-cart/${orderId}/${index}`);
      setUpdation('update');
    } catch (error) {
      console.error('Failed to delete item:', error);
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const addOrderHandler = async () => {
    if (!orderId) return Alert.alert('Error', 'No order found');

    try {
      await axiosInstance.post(`/add-order/${orderId}`, {
        billPayment: payment,
        customerId: selectedCustomer,
      });

      Alert.alert('Success', 'Order placed successfully');
      resetState();
    } catch (error) {
      console.error('Failed to place order:', error);
      Alert.alert('Error', 'Failed to place order');
    }
  };

  const resetState = () => {
    setSelectedCustomer('');
    setCurrentProduct(null);
    setQuantity(1);
    setAddedItems([]);
    setOrderId(undefined);
    setPayment(0);
  };

  const totalBill = addedItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Sell</Text>

      <Picker
        selectedValue={selectedCustomer}
        onValueChange={(itemValue) => setSelectedCustomer(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Customer" value="" />
        {customers.map((customer) => (
          <Picker.Item
            key={customer._id}
            label={customer.name}
            value={customer._id}
          />
        ))}
      </Picker>

      <View style={styles.row}>
        <Picker
          selectedValue={currentProduct}
          onValueChange={(itemValue) => setCurrentProduct(itemValue)}
          style={[styles.picker, { flex: 3 }]}
        >
          <Picker.Item label="Select Product" value="" />
          {products.map((product) => (
            <Picker.Item
              key={product._id}
              label={`${product.name}(${product.category})`}
              value={product._id}
            />
          ))}
        </Picker>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          keyboardType="numeric"
          placeholder="Quantity"
          value={quantity.toString()}
          onChangeText={(text) => setQuantity(Number(text))}
        />
        <Button title="Add" onPress={handleAddItem} />
      </View>

      {/* Render added items */}
      {addedItems.map((item, index) => (
        <View key={index} style={styles.item}>
          <Text>{`${item.product.name} (${item.product.category})`}</Text>
          <Text>{item.qty}</Text>
          <Button
            title="Delete"
            onPress={() => handleDeleteItem(index)}
            color="red"
          />
        </View>
      ))}

<Text>Total Bill: {totalBill}</Text>
<TextInput
  style={styles.input}
  keyboardType="numeric"
  placeholder="Payment"
  value={payment.toString()}
  onChangeText={(text) => setPayment(Number(text))}
/>
<View style={styles.buttonRow}>
  <Button title="Bill" onPress={addOrderHandler} style={styles.button} />
  <Button title="Save" onPress={resetState} color="orange" style={styles.button} />
</View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 40 },
  heading: { fontSize: 24, textAlign: 'center', marginBottom: 16 },
  picker: { marginBottom: 16, borderWidth: 1, borderColor: '#ccc', padding: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 16 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,  // Make each button take up 50% of the space
    marginHorizontal: 4, // Optional: adds a small space between the buttons
  },
});

export default Sell;
