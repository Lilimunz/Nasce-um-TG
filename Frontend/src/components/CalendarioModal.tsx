import * as React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const BG = "#344759";
const TEXT = "#D4E9FF";
const ACCENT = "#336699";

type Props = {
  visible: boolean;
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
};

const pad = (value: number) => String(value).padStart(2, "0");

const getMonthDays = (date: Date) => {
  const firstDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );

  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  );

  const days: Date[] = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    days.push(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        1 - (firstDay.getDay() - index)
      )
    );
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(
      new Date(date.getFullYear(), date.getMonth(), day)
    );
  }

  while (days.length % 7 !== 0) {
    const last = days[days.length - 1];

    days.push(
      new Date(
        last.getFullYear(),
        last.getMonth(),
        last.getDate() + 1
      )
    );
  }

  return days;
};

const isSameDate = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export default function CalendarioModal({
  visible,
  value,
  onChange,
  onClose,
}: Props) {
  const [month, setMonth] = React.useState(
    new Date(value.getFullYear(), value.getMonth(), 1)
  );

  React.useEffect(() => {
    if (visible) {
      setMonth(
        new Date(value.getFullYear(), value.getMonth(), 1)
      );
    }
  }, [visible, value]);

  const monthLabel = month.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Pressable
              onPress={() =>
                setMonth(
                  new Date(
                    month.getFullYear(),
                    month.getMonth() - 1,
                    1
                  )
                )
              }
            >
              <Text style={styles.arrow}>‹</Text>
            </Pressable>

            <Text style={styles.monthLabel}>
              {monthLabel}
            </Text>

            <Pressable
              onPress={() =>
                setMonth(
                  new Date(
                    month.getFullYear(),
                    month.getMonth() + 1,
                    1
                  )
                )
              }
            >
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          </View>

          <View style={styles.weekdays}>
            {["D", "S", "T", "Q", "Q", "S", "S"].map(
              (day, index) => (
                <Text
                  key={`${day}-${index}`}
                  style={styles.weekday}
                >
                  {day}
                </Text>
              )
            )}
          </View>

          <View style={styles.grid}>
            {getMonthDays(month).map((day) => {
              const isCurrentMonth =
                day.getMonth() === month.getMonth();

              const selected = isSameDate(day, value);

              return (
                <Pressable
                  key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                  style={[
                    styles.day,
                    !isCurrentMonth && styles.outsideDay,
                    selected && styles.selectedDay,
                  ]}
                  onPress={() => {
                    onChange(day);
                    onClose();
                  }}
                >
                  <Text style={styles.dayText}>
                    {day.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(20, 28, 36, 0.78)",
  },
  modal: {
    backgroundColor: BG,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(212, 233, 255, 0.15)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  monthLabel: {
    color: TEXT,
    fontFamily: "MuseoModerno-Bold",
    fontSize: 16,
    textTransform: "capitalize",
  },
  arrow: {
    color: TEXT,
    fontSize: 34,
    lineHeight: 34,
    paddingHorizontal: 10,
  },
  weekdays: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  weekday: {
    width: "14.28%",
    textAlign: "center",
    color: "rgba(212, 233, 255, 0.5)",
    fontFamily: "MuseoModerno-Bold",
    fontSize: 11,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  day: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  outsideDay: {
    opacity: 0.3,
  },
  selectedDay: {
    backgroundColor: ACCENT,
  },
  dayText: {
    color: TEXT,
    fontFamily: "MuseoModerno-Medium",
    fontSize: 13,
  },
  closeButton: {
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 10,
  },
  closeText: {
    color: TEXT,
    fontFamily: "MuseoModerno-Bold",
  },
});