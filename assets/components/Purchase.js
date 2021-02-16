import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Store from '../store/Store'
import IAP from 'react-native-iap'
import { observer } from 'mobx-react';
import Modal from 'react-native-modal';
import LinearGradient from "react-native-linear-gradient";
import DeviceInfo from 'react-native-device-info';
import firestore from '@react-native-firebase/firestore';
import { strings } from '../store/strings';


const { height, width } = Dimensions.get('window');
const productIDs = ['com.wake.guard.weekly', 'com.wake.guard.monthly', 'com.wake.guard.yearly']

const Purchase = observer(() => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setApp()
  }, [])

  setApp = async () => {
    IAP.getSubscriptions(productIDs).then(res => {
      setProducts(res)
    })

    await connectFirebase();

    IAP.initConnection().then(() => {
      IAP.flushFailedPurchasesCachedAsPendingAndroid().catch(() => { }).then(() => {
        const purchaseUpdateSubscription = IAP.purchaseUpdatedListener(async purchase => {
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            if (purchase.transactionId !== Store.transactionId) {
              let newToken;
              if (purchase.productId === 'com.wake.guard.weekly') {
                newToken = 15;
              } else if (purchase.productId === 'com.wake.guard.monthly') {
                newToken = 75;
              } else if (purchase.productId === 'com.wake.guard.yearly') {
                newToken = 1000;
              }
              const userData = {
                deviceId: Store.deviceId,
                token: newToken,
                productId: purchase.productId,
                transactionId: purchase.transactionId,
                transactionReceipt: purchase.transactionReceipt,
                transactionDate: purchase.transactionDate,
                originalTransactionDateIOS: purchase.originalTransactionDateIOS !== null ? purchase.originalTransactionDateIOS : purchase.transactionId,
                originalTransactionIdentifierIOS: purchase.originalTransactionIdentifierIOS !== null ? purchase.originalTransactionIdentifierIOS : purchase.transactionDate,
              }

              await firestore().collection('Users').doc(Store.userId).update(userData).catch(e => console.log(e))
              Store._deviceId(userData.deviceId)
              Store._token(userData.token)
              Store._productId(userData.productId)
              Store._transactionId(userData.transactionId)
              Store._transactionReceipt(userData.transactionReceipt)
              Store._transactionDate(userData.transactionDate)
              Store._originalTransactionDateIOS(userData.originalTransactionDateIOS)
              Store._originalTransactionIdentifierIOS(userData.originalTransactionIdentifierIOS)
            }
            console.log('Başarılı')
            await IAP.finishTransaction(purchase, true)
          }
        })
        return () => {
          console.log('kapatıldı')
          purchaseUpdateSubscription.remove()
        }
      })
    })
  }

  connectFirebase = async () => {
    const deviceID = DeviceInfo.getUniqueId();
    const data = await firestore().collection('Users').where('deviceId', '==', deviceID).get();

    if (!data.empty) {
      const user = data.docs[0]
      const userId = user.id
      const userData = user.data()

      if (userData.productId !== null) {
        let ms;
        if (userData.productId === 'com.wake.guard.weekly') {
          ms = 604800000;
          console.log(ms)
        } else if (userData.productId === 'com.wake.guard.monthly') {
          ms = 2592000000;
          console.log(ms)
        } else if (userData.productId === 'com.wake.guard.yearly') {
          ms = 31556952000;
          console.log(ms)
        }

        if (new Date().getTime() <= ms + userData.transactionDate) {
          Store._userId(userId)
          Store._deviceId(userData.deviceId)
          Store._token(userData.token)
          Store._productId(userData.productId)
          Store._transactionId(userData.transactionId)
          Store._transactionReceipt(userData.transactionReceipt)
          Store._transactionDate(userData.transactionDate)
          Store._originalTransactionDateIOS(userData.originalTransactionDateIOS)
          Store._originalTransactionIdentifierIOS(userData.originalTransactionIdentifierIOS)
          console.log('ürünler yüklendi')
        } else {
          Store._userId(userId)
          Store._deviceId(userData.deviceId)
          Store._token(0)
          Store._productId(null)
          Store._transactionId(null)
          Store._transactionReceipt(null)
          Store._transactionDate(null)
          Store._originalTransactionDateIOS(null)
          Store._originalTransactionIdentifierIOS(null)
          Alert.alert(strings.package_expired)
        }
      } else {
        Store._userId(userId)
        Store._deviceId(userData.deviceId)
        Store._token(userData.token)
        Store._productId(userData.productId)
        Store._transactionId(userData.transactionId)
        Store._transactionReceipt(userData.transactionReceipt)
        Store._transactionDate(userData.transactionDate)
        Store._originalTransactionDateIOS(userData.originalTransactionDateIOS)
        Store._originalTransactionIdentifierIOS(userData.originalTransactionIdentifierIOS)
        console.log('ürünler yüklendi')
      }
    } else {
      const userData = {
        deviceId: deviceID,
        token: 5,
        productId: null,
        transactionId: null,
        transactionReceipt: null,
        transactionDate: null,
        originalTransactionDateIOS: null,
        originalTransactionIdentifierIOS: null,
      }
      const addUser = await firestore().collection('Users').add(userData);
      const userId = addUser.id
      console.log(userId)

      Store._userId(userId)
      Store._deviceId(userData.deviceId)
      Store._token(userData.token)
      Store._productId(userData.productId)
      Store._transactionId(userData.transactionId)
      Store._transactionReceipt(userData.transactionReceipt)
      Store._transactionDate(userData.transactionDate)
      Store._originalTransactionDateIOS(userData.originalTransactionDateIOS)
      Store._originalTransactionIdentifierIOS(userData.originalTransactionIdentifierIOS)
    }
  }

  restorePurchase = async () => {
    const purchase = (await IAP.getAvailablePurchases()).sort((a, b) => b.transactionDate - a.transactionDate)[0];
    const data = await firestore().collection('Users').where('originalTransactionIdentifierIOS', '==', purchase.originalTransactionIdentifierIOS).get();
    if (!data.empty) {
      const user = data.docs[0];
      const userId = user.id;
      const userData = user.data();

      userData.deviceId = DeviceInfo.getUniqueId();
      await firestore().collection('Users').doc(userId).update(userData).catch(e => console.log(e))

      if (userData.productId === 'com.wake.guard.weekly') {
        ms = 604800000;
        console.log(ms)
      } else if (userData.productId === 'com.wake.guard.monthly') {
        ms = 2592000000;
        console.log(ms)
      } else if (userData.productId === 'com.wake.guard.yearly') {
        ms = 31556952000;
        console.log(ms)
      }

      if (new Date().getTime() <= ms + userData.transactionDate) {
        Store._userId(userId)
        Store._deviceId(userData.deviceId)
        Store._token(userData.token)
        Store._productId(userData.productId)
        Store._transactionId(userData.transactionId)
        Store._transactionReceipt(userData.transactionReceipt)
        Store._transactionDate(userData.transactionDate)
        Store._originalTransactionDateIOS(userData.originalTransactionDateIOS)
        Store._originalTransactionIdentifierIOS(userData.originalTransactionIdentifierIOS)
        Alert.alert(strings.restore_complated);
      } else {
        Store._userId(userId)
        Store._deviceId(userData.deviceId)
        Store._token(0)
        Store._productId(null)
        Store._transactionId(null)
        Store._transactionReceipt(null)
        Store._transactionDate(null)
        Store._originalTransactionDateIOS(null)
        Store._originalTransactionIdentifierIOS(null)
        Alert.alert(strings.package_expired)
      }
      Alert.alert(strings.restore_complated);
    } else {
      Alert.alert(strings.restore_failed);
    }
  }

  return (
    <Modal isVisible={Store.purchase}>
      <View style={styles.modal}>
        {products.map(product => (
          <TouchableOpacity style={[styles.paymentMethodCard,]} onPress={() => IAP.requestSubscription(product.productId)}>
            <LinearGradient style={styles.deneme} colors={['#2284F0', '#2284F0']} start={{ y: 0.0, x: 0.0 }} end={{ y: 0.0, x: 1.0 }}>
              <View style={styles.pmcTextContainer}>
                <Text style={styles.paymentMethodTitle}>{product.title}</Text>
                <Text style={styles.paymentMethodInfo}>{product.description}</Text>
              </View>
              <Text style={styles.fee}>{product.localizedPrice}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.restoreButton} onPress={() => restorePurchase()}>
          <Text style={styles.modalCancelButtonText}>{strings.restore_purchase}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalCancelButton} onPress={() => Store._purchase(false)}>
          <Text style={styles.modalCancelButtonText}>{strings.close}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
})


export default Purchase

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "#fff",
    height: width * 0.3 * 3 + width * 0.115 * 2 + width * 0.0275 * 6,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  modalCancelButton: {
    width: "93.5%",
    height: width * 0.115,
    backgroundColor: "rgb(255,92,78)",
    borderRadius: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: width * 0.0275,
  },
  restoreButton: {
    width: "93.5%",
    height: width * 0.115,
    backgroundColor: "rgb(55,128,126)",
    borderRadius: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: width * 0.0275,
  },
  modalCancelButtonText: {
    color: "#fff",
    fontSize: RFValue(18),
  },
  paymentMethodCard: {
    width: "93.5%",
    height: width * 0.3,
    borderRadius: 8,
    marginTop: width * 0.0275,
  },
  deneme: {
    width: "100%",
    height: width * 0.3,
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pmcTextContainer: {
    height: width * 0.185,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  paymentMethodTitle: {
    color: "#fff",
    fontSize: RFValue(20),
    marginLeft: width * 0.0275,
    fontWeight: "500"
  },
  paymentMethodInfo: {
    width: width * 0.5,
    color: "#fff",
    fontSize: RFValue(13),
    marginLeft: width * 0.0275,
  },
  fee: {
    color: "#fff",
    fontSize: RFValue(18),
    marginRight: width * 0.0275,
    borderWidth: 1.5,
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 8,
  }
})