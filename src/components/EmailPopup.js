import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const EmailPopup = ({visible, error, onClose, onConfirm, loading}) => {
  const [email, setEmail] = useState('');

  const handleConfirm = () => {
    onConfirm(email);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.popup}>
          <Text style={styles.title}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email..."
            placeholderTextColor={'grey'}
            value={email}
            onChangeText={setEmail}
          />
          {error ? (
            <Text style={{color: 'red', marginTop: 10, textAlign: 'center'}}>
              {error}
            </Text>
          ) : null}
          <TouchableOpacity style={styles.button} onPress={handleConfirm}>
            {loading ? (
              <ActivityIndicator size={20} color={'white'} />
            ) : (
              <Text style={styles.buttonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popup: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: 'black',
  },
  button: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EmailPopup;
