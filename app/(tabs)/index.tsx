import React, { useEffect } from "react";
import { Text, View, StyleSheet, TextInput, Button } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import ICalParser from "ical-js-parser";
import { DateTime } from "luxon";
import * as Notifications from "expo-notifications";

export default function HomeScreen() {
  const [data, setData] = useState<any>(null);

  const [notificationId, setNotificationId] = useState<string>("");

  function parseTime(time: string) {
    return DateTime.fromISO(time).toFormat("t");
  }

  function parseDate(date: string) {
    return DateTime.fromISO(date).toFormat("LLL d, yyyy");
  }

  async function scheduleNotification(shift: any) {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status === "granted") {
      const id: string = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Upcoming Shift",
          body: `You have a shift coming up: ${shift.summary} on ${parseDate(
            shift.dtstamp.value
          )} at ${parseTime(shift.dtstart.value)}`,
        },
        trigger: {
          seconds: 5,
        },
      });

      console.log(id);
      setNotificationId(id);
    } else {
      console.log("Permission to send notifications was denied");
    }
    // Cancel the previous notification if it exists
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }

    // Schedule a new notification
  }
  function getUpcomingEvent(events: any[]) {
    const now = DateTime.now();
  
    // Convert the event date to a Luxon DateTime object
    const parseDateTime = (dateStr: string, timezone: any) => {
      return DateTime.fromISO(dateStr, { zone: timezone });
    };
  
    // Filter and sort events
    const upcomingEvents = events
      .map(event => {
        const dtstart = parseDateTime(event.dtstart.value, event.dtstart.timezone);
        return {...event, dtstart};
      })
      .filter(event => event.dtstart > now)
      .sort((a, b) => a.dtstart - b.dtstart);
  
    // Return the first upcoming event
    return upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  }

  async function getL1ndaData() {
    let result = await SecureStore.getItemAsync("l1ndaLink");
    fetch(`${result}`)
      .then((response) => response.text())
      .then((data) => {
        const upcomingIcalEvent = getUpcomingEvent(ICalParser.toJSON(data).events)
        setData(upcomingIcalEvent);
        scheduleNotification(upcomingIcalEvent);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }
  return (
    <View style={styles.container}>
      <Button title="Get L1nda Data" onPress={getL1ndaData} />
      <Text>
        Next Shift:
        {data?.summary}
      </Text>
      <Text>
        Attendee:
        {data?.attendee}
      </Text>
      <Text>
        Organizer:
        {data?.organizer}
      </Text>
      <Text>
        Start Time:
        {parseTime(data?.dtstart["value"])}
      </Text>
      <Text>
        End Time:
        {parseTime(data?.dtend["value"])}
      </Text>
      <Text>
        Date:
        {parseDate(data?.dtstamp["value"])}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 10,
    backgroundColor: "#ecf0f1",
    padding: 8,
  },
  paragraph: {
    marginTop: 34,
    margin: 24,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  textInput: {
    height: 35,
    borderColor: "gray",
    borderWidth: 0.5,
    padding: 4,
  },
});
