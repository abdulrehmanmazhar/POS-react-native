import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import { useRoute } from '@react-navigation/native';

const Sell = () => {
  const route = useRoute();
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [addedItems, setAddedItems] = useState([]);
  const [payment, setPayment] = useState(0);
  const { customerId, customerName } = route.params || {};
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (customerId) {
      setSelectedCustomer(customerId);
    }
    fetchProducts();
  }, [customerId]);

  const fetchProducts = async () => {
    try {
      const { data } = await axiosInstance.get('/get-products');
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
    }
  };

  const handleToggleItem = (productId) => {
    setAddedItems((prevItems) => {
      const exists = prevItems.find((item) => item.productId === productId);
      if (exists) {
        return prevItems.filter((item) => item.productId !== productId);
      }
      return [...prevItems, { productId, qty: 1 }];
    });
  };

  const handleQuantityChange = (productId, qty) => {
    setAddedItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, qty: Number(qty) } : item
      )
    );
  };

  const handleSave = async () => {
    if (addedItems.length === 0) {
      return Alert.alert('Error', 'No items selected to save.');
    }
  
    try {
      let tempOrderId = orderId; // Start with the current `orderId`.
  
      for (const item of addedItems) {
        const { data } = await axiosInstance.post(`/fill-cart/${selectedCustomer}`, item);
        if (data.order && data.order._id) {
          tempOrderId = data.order._id; // Update tempOrderId dynamically.
        }
      }
  
      if (!tempOrderId) {
        throw new Error('Failed to retrieve orderId from server.');
      }
  
      console.log(tempOrderId);
      setOrderId(tempOrderId); // Update state after all operations are complete.
      Alert.alert('Success', 'Cart saved successfully!');
      setAddedItems([]); // Clear added items for a fresh cart.
    } catch (error) {
      console.error('Error saving cart:', error);
      Alert.alert('Error', 'Failed to save cart.');
    }
  };
  
  
  

  const totalBill = addedItems.reduce(
    (sum, item) => {
      const product = products.find((p) => p._id === item.productId);
      return sum + (product ? product.price * item.qty : 0);
    },
    0
  );

  const totalDiscount = addedItems.reduce(
    (sum, item) => {
      const product = products.find((p) => p._id === item.productId);
      return sum + (product ? product.discount * item.qty : 0);
    },
    0
  );
  const handleSaveAndBill = async () =>{
    try {
      if (addedItems.length === 0) {
        return Alert.alert('Error', 'No items selected to save.');
      }
    
      let tempOrderId = orderId; // Start with the current `orderId`.
      try {
    
        for (const item of addedItems) {
          const { data } = await axiosInstance.post(`/fill-cart/${selectedCustomer}`, item);
          if (data.order && data.order._id) {
            tempOrderId = data.order._id; // Update tempOrderId dynamically.
          }
        }
    
        if (!tempOrderId) {
          throw new Error('Failed to retrieve orderId from server.');
        }
    
        console.log(tempOrderId);
        setOrderId(tempOrderId); // Update state after all operations are complete.
        Alert.alert('Success', 'Cart saved successfully!');
        setAddedItems([]); // Clear added items for a fresh cart.
      } catch (error) {
        console.error('Error saving cart:', error);
        Alert.alert('Error', 'Failed to save cart.');
      }
      console.log(payment, orderId);
      const response = await axiosInstance.post(`/add-order/${tempOrderId}`, {billPayment:payment, customerId, instructionNote:''});
      Alert.alert('Success', 'Order Placed successfully!');
      setPayment(0);
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order.');
    }

  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Customer: {customerName}</Text>

      <View>
        <Text style={styles.header}>Products</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.columnHeader}>Name</Text>
          <Text style={styles.columnHeader}>Dis.</Text>
          <Text style={styles.columnHeader}>Stock</Text>
          <Text style={styles.columnHeader}>Qty</Text>
          <Text style={styles.columnHeader}>Action</Text>
        </View>

        {products.map((product) => {
          const isSelected = addedItems.some((item) => item.productId === product._id);

          return (
            <View key={product._id} style={styles.row}>
              <Text style={styles.cell}>{`${product.name}(${product.category})`}</Text>
              <Text style={styles.cell}>{product.discount}</Text>
              <Text style={styles.cell}>{product.stockQty}</Text>
              {isSelected ? (
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={
                    addedItems.find((item) => item.productId === product._id)?.qty.toString() || '1'
                  }
                  onChangeText={(text) => handleQuantityChange(product._id, text)}
                />
              ) : (
                <Text style={styles.cell}>-</Text>
              )}
              <Button
                title={isSelected ? 'Remove' : 'Add'}
                onPress={() => handleToggleItem(product._id)}
              />
            </View>
          );
        })}
      </View>

      <Text>Total Bill: Rs. {totalBill}</Text>
      <Text>Discount: Rs. {totalDiscount}</Text>
      <Text>Sub Total: Rs. {totalBill - totalDiscount}</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Payment"
        value={payment.toString()}
        onChangeText={(text) => setPayment(Number(text))}
      />

      <View style={styles.buttonRow}>
        {/* <Button title="Save without payment" onPress={handleSave} color="orange" style={styles.button} /> */}
        <Button title="Save & bill" onPress={handleSaveAndBill} color="green" style={styles.button} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 40 },
  heading: { fontSize: 18, textAlign: 'center', marginBottom: 16 },
  header: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 4,
  },
  columnHeader: { fontWeight: 'bold', flex: 1, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cell: { flex: 1, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 4, flex: 1, textAlign: 'center' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

export default Sell;
