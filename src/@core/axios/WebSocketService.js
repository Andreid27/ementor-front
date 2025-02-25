// WebSocketService.js
import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'
import * as apiSpec from 'src/apiSpec'

class WebSocketService {
  static instance = null
  static getInstance() {
    return this.instance || (this.instance = new WebSocketService())
  }

  constructor() {
    if (WebSocketService.instance) {
      return WebSocketService.instance
    }

    this.stompClient = null
    this.retryInterval = 5000
    this.timeoutId = null
    this.auth = null
    this.dispatch = null
    this.subscriptions = []
    this.connectionAttempts = 0
    this.maxConnectionAttempts = 5
    this.isConnected = false

    WebSocketService.instance = this
  }

  static initialize(auth, callback) {
    const instance = this.getInstance()
    instance.auth = auth
    instance.dispatch = callback

    if (!instance.isConnected) {
      instance.connect()
    }

    return instance
  }

  connect() {
    if (this.stompClient?.connected) return
    if (!this.auth?.user?.id) {
      console.error('Cannot connect: No user ID available')

      return
    }

    const socket = new SockJS(`${apiSpec.PROD_HOST}/${apiSpec.NOTIFICATION_SERVICE}/wsevents`)

    // const socket = new SockJS(`http://localhost:49205/wsevents`)
    this.stompClient = Stomp.over(socket)

    this.stompClient.connect({}, this.handleSuccessfulConnection.bind(this), this.handleConnectionError.bind(this))
  }

  handleSuccessfulConnection(frame) {
    console.log('Connected:', frame)
    this.connectionAttempts = 0
    this.isConnected = true
    this.subscribeToNotifications()
  }

  handleConnectionError(error) {
    console.error('Connection error:', error)
    this.isConnected = false
    this.retryConnection()
  }

  subscribeToNotifications() {
    const notificationSubscription = this.stompClient.subscribe(
      `/topic/notifications/${this.auth.user.id}`,
      message => {
        try {
          const notification = JSON.parse(message.body)
          notification.content = JSON.parse(notification.content)
          notification.creation = Date.now()
          this.dispatch(notification)
        } catch (error) {
          console.error('Error processing notification:', error)
        }
      }
    )

    this.subscriptions.push(notificationSubscription)
  }

  retryConnection() {
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.error('Max connection attempts reached. Giving up.')

      return
    }

    this.connectionAttempts++
    console.log(`Retrying connection (attempt ${this.connectionAttempts})...`)

    this.timeoutId = setTimeout(() => {
      this.connect()
    }, this.retryInterval)
  }

  disconnect() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    if (this.stompClient) {
      this.subscriptions.forEach(subscription => subscription.unsubscribe())
      this.subscriptions = []

      if (this.stompClient.connected) {
        this.stompClient.disconnect(() => {
          this.isConnected = false
        })
      }

      this.stompClient = null
    }

    console.log('WebSocket disconnected')
  }
}

export default WebSocketService
