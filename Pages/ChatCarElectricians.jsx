import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  useLayoutEffect,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, off } from "firebase/database";
import firebaseConfig from "../firebaseConfig";
import { AuthContext } from "../Context/AuthProvider";
import { useFocusEffect } from "@react-navigation/native";
import LoadingSpinner from "../Components/LoadingSpinner";
import * as Notifications from "expo-notifications";
import { sendPushNotification } from "../PushNotification/sendPushNotification";
import { TouchableWithoutFeedback } from "react-native";
import { Alert } from "react-native";

import axios from "axios";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ChatCarElectricians = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState(
    selectedMessage ? `Re: ${selectedMessage.text}` : ""
  );
  const [notification, setNotification] = useState(false);
  const flatListRef = useRef(null);
  const { user, setUser } = useContext(AuthContext);
  var messageRef;
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {});

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const app = initializeApp(firebaseConfig);
  function storeMessageInFireBase(message) {
    const db = getDatabase();
    const reference = ref(
      db,
      "Messages/carElectricians/" + message.timestamp.getTime()
    );
    set(reference, {
      text: message.text,
      sender: message.sender,
      timestamp: message.timestamp.getTime(),
      phone: message.phone,
    });
  }
  //   useEffect(() => {
  //     const timeoutId = setTimeout(() => {
  //       if (flatListRef.current) {
  //         flatListRef.current.scrollToEnd({ animated: true });
  //       }
  //     }, 500);
  //     return () => clearTimeout(timeoutId);
  //   }, [messages]);

  useFocusEffect(
    React.useCallback(() => {
      const timeoutId = setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }, [messages])
  );

  useEffect(() => {
    const db = getDatabase();
    const messagesRef = ref(db, "Messages/carElectricians");
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const newMessages = Object.entries(data).map(([key, value]) => ({
          ...value,
          timestamp: new Date(value.timestamp),
        }));
        setMessages(newMessages);
        setLoading(false);
      }
    });

    return () => {
      off(messagesRef);
    };
  }, []);

  const handleSend = () => {
    if (inputText !== "") {
      const newMessage = {
        text:
          (selectedMessage
            ? `RE: ${selectedMessage.sender}: ${selectedMessage.text}\n`
            : "") + inputText,
        sender: `${user.FName} ${user.LName}`,
        timestamp: new Date(),
        phone: user.Phone,
      };

      setMessages([...messages, newMessage]);
      storeMessageInFireBase(newMessage);
      setInputText("");
      setSelectedMessage(null);
      flatListRef.current.scrollToEnd({ animated: true });
      sendPushNotificationForRelevantVolunteers(2, newMessage.text);
    }
  };
  const sendPushNotificationForRelevantVolunteers = (
    expertiseId,
    messageBody
  ) => {
    const chatPushNotificationapi = `getPushTokensForChat/${expertiseId}/phone/${user.Phone}`;
    axios
      .get(chatPushNotificationapi)
      .then(async (res) => {
        const pushTokensArray = res.data;
        const message = {
          title: "New chat message",
          body: `${user.FName} ${user.LName} : ${messageBody}`,
          screen: "ChatCarElectricians",
        };
        pushTokensArray.forEach(async (element) => {
          await sendPushNotification(element.expo_push_token, message);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleReply = (text, sender) => {
    const textArray = text.split("\n");
    const filteredText = textArray[textArray.length - 1];
    setSelectedMessage({ text: filteredText, sender });
  };
  const handleDelete = (message) => {
    if (message.phone === user.Phone) {
      messages.filter((item) => item.timestamp !== message.timestamp);
      const db = getDatabase();
      const reference = ref(
        db,
        `Messages/carElectricians/${message.timestamp.getTime()}`
      );
      set(reference, null);
    } else {
      alert("You can only delete your own messages");
    }
  };

  const renderMessage = ({ item, index }) => {
    const messageContainerStyle =
      item.phone === `${user.Phone}`
        ? styles.myMessageContainer
        : styles.otherMessageContainer;
    const messageTextStyle =
      item.phone === `${user.Phone}`
        ? styles.myMessageText
        : styles.otherMessageText;
    const messageAlignSelf =
      item.phone === `${user.Phone}` ? "flex-end" : "flex-start";

    let dateTitle;
    if (
      index === 0 ||
      messages[index - 1].timestamp.toDateString() !==
        item.timestamp.toDateString()
    ) {
      dateTitle = (
        <Text style={styles.dateText}>{item.timestamp.toDateString()}</Text>
      );
    }

    const handleLongPress = (message) => {
      Alert.alert(
        "Message options",
        "Choose an option",
        [
          {
            text: "Reply",
            onPress: () => handleReply(item.text, item.sender),
          },
          {
            text: "Delete",
            onPress: () => handleDelete(message),
            style: "destructive",
          },
          {
            text: "Cancel",
            onPress: () => console.log("Cancel"),
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    };

    return (
      <View>
        {dateTitle}
        <View
          style={[styles.messageContainer, { alignSelf: messageAlignSelf }]}
        >
          {item.phone !== `${user.Phone}` && (
            <Text style={styles.senderText}>{item.sender}</Text>
          )}
          <View
            style={[
              messageContainerStyle,
              { marginTop: item.phone !== `${user.Phone}` ? 5 : 0 },
            ]}
          >
            {/* {selectedMessage &&
              selectedMessage.text === item.text &&
              selectedMessage.sender === item.sender && (
                <View style={styles.replyContainer}>
                  <Text style={styles.replySender}>{item.sender}</Text>
                  <Text style={styles.replyText}>{item.text}</Text>
                </View>
              )} */}
            <TouchableWithoutFeedback
              style={[
                styles.messageContainer,
                { alignSelf: messageAlignSelf },
                messageContainerStyle,
              ]}
              onLongPress={() => handleLongPress(item)}
            >
              <Text style={messageTextStyle}>{item.text}</Text>
            </TouchableWithoutFeedback>
            <Text style={styles.timestampText}>
              {item.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                seconds: false,
              })}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "android" ? 0 : 100}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          style={styles.messagesContainer}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderMessage}
        />
        <View style={styles.inputContainer}>
          {selectedMessage ? (
            <View style={styles.selectedMessageContainer}>
              <Text style={styles.selectedMessageSender}>
                {selectedMessage.sender}
              </Text>
              <Text style={styles.selectedMessageText}>
                {selectedMessage.text}
              </Text>
            </View>
          ) : null}
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={(text) => setInputText(text)}
            placeholder="Type a message"
          />

          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  myMessageContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C5",
    borderRadius: 10,
    padding: 10,
    maxWidth: "70%",
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 10,
    maxWidth: "70%",
  },
  myMessageText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#000",
  },
  otherMessageText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#000",
  },
  senderText: {
    fontSize: 12,
    color: "#AAA",
    marginRight: 5,
  },
  timestampText: {
    fontSize: 12,
    color: "#AAA",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 18,
    backgroundColor: "#FFF",
  },
  input: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    fontSize: 16,
    lineHeight: 22,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sendButtonText: {
    color: "#FFF",
    fontSize: 16,
    lineHeight: 22,
  },
  dateText: {
    fontSize: 12,
    color: "#000000",
    fontWeight: "bold",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "#FFF",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  selectedMessageContainer: {
    padding: 10,
    backgroundColor: "#F6F6F6",
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedMessageSender: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  selectedMessageText: {
    fontSize: 14,
  },
});

export default ChatCarElectricians;
