import mobx, { action, observable, toJS } from "mobx";
import { Alert } from "react-native";


class Store {
    @observable latitude
    @observable longitude
    @observable latitudeDelta = 0.0075
    @observable longitudeDelta = 0.0075
    @observable targetName = 'Use to search detailed locations'
    @observable purchase = false
    @observable alarm = true
    @observable mapReferance
    @observable radius
    @observable remaining
    @observable history = '[]'
    @observable favorite = '[]'

    @observable userId = null
    @observable deviceId = null 
    @observable token = null 
    @observable productId = null
    @observable transactionId = null 
    @observable transactionReceipt = null
    @observable transactionDate = null
    @observable originalTransactionDateIOS = null
    @observable originalTransactionIdentifierIOS = null

    @action _latitude = (value) => {
        valueText = value.toString();
        valueText = valueText.substring(0, 7)
        valueFloat = parseFloat(valueText)
        this.latitude = valueFloat
    }

    @action _longitude = (value) => {
        valueText = value.toString();
        valueText = valueText.substring(0, 7)
        valueFloat = parseFloat(valueText)
        this.longitude = valueFloat
    }

    @action _latitudeDelta = (value) => {
        this.latitudeDelta = value
    }

    @action _longitudeDelta = (value) => {
        this.longitudeDelta = value
    }
    @action _targetName = (value) => {
        this.targetName = value
    }
    @action _mapReferance = (value) => {
        this.mapReferance = value
    }
    @action _radius = (value) => {
        this.radius = value
    }
    @action _purchase = (value) => {
        this.purchase = value
    }
    @action _alarm = (value) => {
        this.alarm = value
    }
    @action _remaining = (value) => {
        this.remaining = value
    }
    @action _history = (value) => {
        this.history = value
    }
    @action _favorite = (value) => {
        this.favorite = value
    }
    @action _addHistory = value => {
        const historyJS = JSON.parse(this.history)
        historyJS.unshift(value)
        if (historyJS.length > 10) {
            historyJS.pop()
        }
        this.history = JSON.stringify(historyJS)
    }
    @action _addFavorite = value => {
        const favoriteJS = JSON.parse(this.favorite)

        if (!favoriteJS.some(data => data.time === value.time)) {
            favoriteJS.unshift(value)
        } else {
            Alert.alert('Ekleme', 'Bu konum çoktan favorilere eklendi')
        }
        this.favorite = JSON.stringify(favoriteJS)
    }
    @action _deleteHistory = value => {
        const historyJS = JSON.parse(this.history)
        const historyIndex = historyJS.findIndex(data => data.time === value.time)
        historyJS.splice(historyIndex, 1)
        this.history = JSON.stringify(historyJS)
    }
    @action _deleteFavorite = value => {
        const favoriteJS = JSON.parse(this.favorite)
        const favoriteIndex = favoriteJS.findIndex(data => data.time === value.time)
        console.log(favoriteIndex)
        favoriteJS.splice(favoriteIndex, 1)
        this.favorite = JSON.stringify(favoriteJS)
    }
    @action _userId = value => {
        this.userId = value
    }
    @action _deviceId = value => {
        this.deviceId = value
    }
    @action _token = value => {
        this.token = value
    }
    @action _productId = value => {
        this.productId = value
    }
    @action _transactionId = value => {
        this.transactionId = value
    }
    @action _transactionReceipt = value => {
        this.transactionReceipt = value
    }
    @action _transactionDate = value => {
        this.transactionDate = value
    }
    @action _originalTransactionDateIOS = value => {
        this.originalTransactionDateIOS = value
    }
    @action _originalTransactionIdentifierIOS = value => {
        this.originalTransactionIdentifierIOS = value
    }
    

}




export default new Store()
