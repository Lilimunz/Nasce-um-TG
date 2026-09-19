import * as React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import CalendarioModal from "../components/CalendarioModal";
import BarraNavegacao from "../components/BarraNavegacao";
import {
  criarLembrete,
  listarLembretes,
  removerLembrete,
} from "../services/lembretesService";

const BG = "#344759";
const TEXT = "#D4E9FF";
const ACCENT = "#336699";

const PETS_CACHE_KEY = "petsList";
const REMINDERS_CACHE_KEY = "@nasce_um_tg_lembretes_cache";

const API_URL =
  Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_API_URL_WEB || "http://localhost:3000"
    : process.env.EXPO_PUBLIC_API_MAPS || "http://10.0.2.2:3000";

const CATEGORIES = [
  "Veterinário",
  "Exame",
  "Vacina",
  "Medicamento",
  "Banho",
  "Outro",
];

type Pet = {
  codigo_pet: number;
  nome: string;
  especie?: string;
  raca?: string;
};

type Reminder = {
  codigo_lembrete: number;
  codigo_pet: number;
  pet_nome: string;
  categoria: string;
  observacao: string;
  data: string;
  horario: string;
};

type AgendaProps = {
  navigation: any;
};

const pad = (value: number) => String(value).padStart(2, "0");

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const getWeekStart = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - result.getDay());
  return result;
};

const getWeekEnd = (date: Date) => {
  const result = getWeekStart(date);
  result.setDate(result.getDate() + 6);
  return result;
};

const formatShortDate = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

const formatMonthName = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

const formatWeekday = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    weekday: "long",
  });

const getMonthDays = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

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
    days.push(new Date(date.getFullYear(), date.getMonth(), day));
  }

  while (days.length % 7 !== 0) {
    const lastDayInGrid = days[days.length - 1];

    days.push(
      new Date(
        lastDayInGrid.getFullYear(),
        lastDayInGrid.getMonth(),
        lastDayInGrid.getDate() + 1
      )
    );
  }

  return days;
};

const getReminderDate = (reminder: Reminder) =>
  parseDateKey(reminder.data);

const sortReminders = (items: Reminder[]) =>
  [...items].sort((first, second) =>
    `${first.data}${first.horario}`.localeCompare(
      `${second.data}${second.horario}`
    )
  );

const PaginaDeAgenda = ({ navigation }: AgendaProps) => {
  const [reminders, setReminders] = React.useState<Reminder[]>([]);
  const [pets, setPets] = React.useState<Pet[]>([]);

  const [view, setView] = React.useState<"semana" | "mes">("semana");
  const [monthCursor, setMonthCursor] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [calendarVisible, setCalendarVisible] = React.useState(false);
  const [petMenuVisible, setPetMenuVisible] = React.useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] =
    React.useState(false);

  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedPet, setSelectedPet] = React.useState<Pet | null>(null);
  const [category, setCategory] = React.useState("");
  const [time, setTime] = React.useState("09:00");
  const [note, setNote] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [loadingReminders, setLoadingReminders] = React.useState(true);

  const carregarPets = React.useCallback(async () => {
    try {
      const codigoTutor = await AsyncStorage.getItem("codigoTutor");

      if (!codigoTutor) {
        setPets([]);
        return;
      }

      const response = await axios.get(
        `${API_URL}/tutor/${codigoTutor}/perfil`
      );

      const petsFromApi = Array.isArray(response.data?.pets)
        ? response.data.pets
        : [];

      setPets(petsFromApi);

      await AsyncStorage.setItem(
        PETS_CACHE_KEY,
        JSON.stringify(petsFromApi)
      );
    } catch (error) {
      console.error("Erro ao carregar pets:", error);

      try {
        const cachedPets = await AsyncStorage.getItem(PETS_CACHE_KEY);
        setPets(cachedPets ? JSON.parse(cachedPets) : []);
      } catch (cacheError) {
        console.error("Erro ao carregar pets do cache:", cacheError);
        setPets([]);
      }
    }
  }, []);

  const carregarLembretes = React.useCallback(async () => {
    setLoadingReminders(true);

    try {
      const codigoTutor = await AsyncStorage.getItem("codigoTutor");

      if (!codigoTutor) {
        setReminders([]);
        return;
      }

      const data = await listarLembretes(codigoTutor);
      const sorted = sortReminders(data);

      setReminders(sorted);

      await AsyncStorage.setItem(
        REMINDERS_CACHE_KEY,
        JSON.stringify(sorted)
      );
    } catch (error) {
      console.error("Erro ao carregar lembretes da API:", error);

      try {
        const cachedReminders = await AsyncStorage.getItem(
          REMINDERS_CACHE_KEY
        );

        setReminders(
          cachedReminders ? JSON.parse(cachedReminders) : []
        );
      } catch (cacheError) {
        console.error(
          "Erro ao carregar lembretes do cache:",
          cacheError
        );

        setReminders([]);
      }
    } finally {
      setLoadingReminders(false);
    }
  }, []);

  React.useEffect(() => {
    carregarPets();
    carregarLembretes();

    const unsubscribe = navigation.addListener("focus", () => {
      carregarPets();
      carregarLembretes();
    });

    return unsubscribe;
  }, [navigation, carregarPets, carregarLembretes]);

  const resetForm = () => {
    setSelectedDate(new Date());
    setSelectedPet(null);
    setCategory("");
    setTime("09:00");
    setNote("");
    setPetMenuVisible(false);
    setCategoryMenuVisible(false);
    setCalendarVisible(false);
  };

  const abrirModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const fecharModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const atualizarCache = async (items: Reminder[]) => {
    await AsyncStorage.setItem(
      REMINDERS_CACHE_KEY,
      JSON.stringify(items)
    );
  };

  const salvarNovoLembrete = async () => {
    if (!selectedPet) {
      Alert.alert("Atenção", "Selecione um pet.");
      return;
    }

    if (!category) {
      Alert.alert("Atenção", "Selecione uma classificação.");
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert("Atenção", "Informe um horário válido no formato HH:MM.");
      return;
    }

    try {
      setLoading(true);

      const dateKey = formatDateKey(selectedDate);

      const codigoLembrete = await criarLembrete({
        codigo_pet: selectedPet.codigo_pet,
        categoria: category,
        observacao: note.trim(),
        data: dateKey,
        horario: time,
      });

      const novoLembrete: Reminder = {
        codigo_lembrete: codigoLembrete,
        codigo_pet: selectedPet.codigo_pet,
        pet_nome: selectedPet.nome,
        categoria: category,
        observacao: note.trim(),
        data: dateKey,
        horario: time,
      };

      const updated = sortReminders([...reminders, novoLembrete]);

      setReminders(updated);
      await atualizarCache(updated);

      fecharModal();

      Alert.alert("Sucesso", "Lembrete criado com sucesso.");
    } catch (error: any) {
      console.error("Erro ao salvar lembrete:", error);

      Alert.alert(
        "Erro",
        error?.message || "Não foi possível salvar o lembrete."
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmarExclusao = (reminder: Reminder) => {
    Alert.alert(
      "Excluir lembrete",
      "Deseja realmente excluir este lembrete?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              await removerLembrete(reminder.codigo_lembrete);

              const updated = reminders.filter(
                (item) =>
                  item.codigo_lembrete !== reminder.codigo_lembrete
              );

              setReminders(updated);
              await atualizarCache(updated);
            } catch (error: any) {
              console.error("Erro ao excluir lembrete:", error);

              Alert.alert(
                "Erro",
                error?.message ||
                  "Não foi possível excluir o lembrete."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getRemindersForDate = (date: Date) => {
    const dateKey = formatDateKey(date);

    return reminders.filter((item) => item.data === dateKey);
  };

  const remindersForMonth = reminders.filter((reminder) => {
    const date = getReminderDate(reminder);

    return (
      date.getMonth() === monthCursor.getMonth() &&
      date.getFullYear() === monthCursor.getFullYear()
    );
  });

  const remindersForSelectedDay = selectedDay
    ? reminders.filter((reminder) => reminder.data === selectedDay)
    : [];

  const remindersForCurrentWeek = reminders.filter((reminder) => {
    const reminderDate = getReminderDate(reminder);
    const now = new Date();

    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(now);

    return reminderDate >= weekStart && reminderDate <= weekEnd;
  });

  const remindersToShow =
    view === "mes"
      ? selectedDay
        ? remindersForSelectedDay
        : remindersForMonth
      : remindersForCurrentWeek;

  const renderReminder = (reminder: Reminder) => {
    const date = getReminderDate(reminder);

    return (
      <View
        key={reminder.codigo_lembrete}
        style={styles.reminderCard}
      >
        <View style={styles.dateBox}>
          <Text style={styles.dateNumber}>{date.getDate()}</Text>

          <Text style={styles.dateMonth}>
            {date.toLocaleDateString("pt-BR", {
              month: "short",
            })}
          </Text>
        </View>

        <View style={styles.reminderInfo}>
          <Text style={styles.reminderTitle}>
            {reminder.categoria} · {reminder.pet_nome}
          </Text>

          <Text style={styles.reminderMeta}>
            {formatWeekday(date)} · {reminder.horario}
          </Text>

          {reminder.observacao ? (
            <Text style={styles.reminderNote}>
              {reminder.observacao}
            </Text>
          ) : null}
        </View>

        <Pressable
          style={styles.deleteButton}
          onPress={() => confirmarExclusao(reminder)}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={`Excluir lembrete de ${reminder.pet_nome}`}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Agenda</Text>
        <Text style={styles.headerTitle}>Lembretes</Text>

        <View style={styles.toggleContainer}>
          <Pressable
            style={[
              styles.toggleButton,
              view === "semana" && styles.toggleButtonActive,
            ]}
            onPress={() => {
              setView("semana");
              setSelectedDay(null);
            }}
          >
            <Text
              style={[
                styles.toggleText,
                view === "semana" && styles.toggleTextActive,
              ]}
            >
              Semana
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.toggleButton,
              view === "mes" && styles.toggleButtonActive,
            ]}
            onPress={() => setView("mes")}
          >
            <Text
              style={[
                styles.toggleText,
                view === "mes" && styles.toggleTextActive,
              ]}
            >
              Mês
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {view === "semana" ? (
          <View style={styles.weekInfo}>
            <Text style={styles.sectionLabel}>
              Semana atual
            </Text>

            <Text style={styles.sectionDescription}>
              {formatShortDate(getWeekStart(new Date()))} até{" "}
              {formatShortDate(getWeekEnd(new Date()))}
            </Text>
          </View>
        ) : (
          <View style={styles.calendarSection}>
            <View style={styles.monthHeader}>
              <Pressable
                onPress={() =>
                  setMonthCursor(
                    new Date(
                      monthCursor.getFullYear(),
                      monthCursor.getMonth() - 1,
                      1
                    )
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Mês anterior"
              >
                <Text style={styles.monthArrow}>‹</Text>
              </Pressable>

              <Text style={styles.monthTitle}>
                {formatMonthName(monthCursor)}
              </Text>

              <Pressable
                onPress={() =>
                  setMonthCursor(
                    new Date(
                      monthCursor.getFullYear(),
                      monthCursor.getMonth() + 1,
                      1
                    )
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Próximo mês"
              >
                <Text style={styles.monthArrow}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekDaysRow}>
              {["D", "S", "T", "Q", "Q", "S", "S"].map(
                (day, index) => (
                  <Text
                    key={`${day}-${index}`}
                    style={styles.weekDay}
                  >
                    {day}
                  </Text>
                )
              )}
            </View>

            <View style={styles.calendarGrid}>
              {getMonthDays(monthCursor).map((day) => {
                const dateKey = formatDateKey(day);
                const inMonth =
                  day.getMonth() === monthCursor.getMonth();
                const hasReminder =
                  getRemindersForDate(day).length > 0;
                const selected = selectedDay === dateKey;
                const today = isSameDay(day, new Date());

                return (
                  <Pressable
                    key={dateKey}
                    style={[
                      styles.calendarDay,
                      !inMonth && styles.calendarDayOutside,
                      hasReminder &&
                        styles.calendarDayWithReminder,
                      selected && styles.calendarDaySelected,
                      today && styles.calendarDayToday,
                    ]}
                    onPress={() => setSelectedDay(dateKey)}
                    accessibilityRole="button"
                    accessibilityLabel={`Selecionar ${day.toLocaleDateString(
                      "pt-BR"
                    )}`}
                  >
                    <Text style={styles.calendarDayText}>
                      {day.getDate()}
                    </Text>

                    {hasReminder ? (
                      <View style={styles.reminderDot} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {selectedDay ? (
              <Pressable
                style={styles.clearSelectionButton}
                onPress={() => setSelectedDay(null)}
              >
                <Text style={styles.clearSelectionText}>
                  Mostrar todos os lembretes do mês
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}

        {loadingReminders ? (
          <Text style={styles.emptyText}>
            Carregando lembretes...
          </Text>
        ) : remindersToShow.length === 0 ? (
          <Text style={styles.emptyText}>
            {view === "mes" && selectedDay
              ? "Nenhum lembrete neste dia."
              : view === "mes"
                ? "Nenhum lembrete neste mês."
                : "Nenhum lembrete nesta semana."}
          </Text>
        ) : (
          remindersToShow.map(renderReminder)
        )}
      </ScrollView>

      <Pressable
        style={[styles.fab, loading && styles.disabledButton]}
        onPress={abrirModal}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Novo lembrete"
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <BarraNavegacao
        navigation={navigation}
        active="agenda"
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={fecharModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Novo lembrete
              </Text>

              <Pressable
                onPress={fecharModal}
                accessibilityRole="button"
                accessibilityLabel="Fechar formulário"
              >
                <Text style={styles.closeButton}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>Data *</Text>

              <Pressable
                style={styles.selectInput}
                onPress={() => setCalendarVisible(true)}
              >
                <Text style={styles.selectText}>
                  {selectedDate.toLocaleDateString("pt-BR")}
                </Text>

                <Text style={styles.selectArrow}>⌄</Text>
              </Pressable>

              <Text style={styles.label}>Horário</Text>

              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder="09:00"
                placeholderTextColor="rgba(212, 233, 255, 0.45)"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                style={styles.input}
              />

              <Text style={styles.label}>Pet *</Text>

              <Pressable
                style={styles.selectInput}
                onPress={() => {
                  setPetMenuVisible((visible) => !visible);
                  setCategoryMenuVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.selectText,
                    !selectedPet && styles.placeholderText,
                  ]}
                >
                  {selectedPet?.nome || "Selecione o pet"}
                </Text>

                <Text style={styles.selectArrow}>⌄</Text>
              </Pressable>

{petMenuVisible ? (
  <View style={styles.optionsContainer}>
    {pets.length === 0 ? (
      <Text style={styles.emptyOption}>
        Nenhum pet encontrado.
      </Text>
    ) : (
      <ScrollView
        style={styles.optionsScroll}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        {pets.map((pet) => (
          <Pressable
            key={pet.codigo_pet}
            style={styles.option}
            onPress={() => {
              setSelectedPet(pet);
              setPetMenuVisible(false);
            }}
          >
            <Text style={styles.optionText}>
              {pet.nome}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    )}
  </View>
) : null}

              <Text style={styles.label}>
                Classificação *
              </Text>

              <Pressable
                style={styles.selectInput}
                onPress={() => {
                  setCategoryMenuVisible((visible) => !visible);
                  setPetMenuVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.selectText,
                    !category && styles.placeholderText,
                  ]}
                >
                  {category || "Selecione a classificação"}
                </Text>

                <Text style={styles.selectArrow}>⌄</Text>
              </Pressable>

{categoryMenuVisible ? (
  <View style={styles.optionsContainer}>
    <ScrollView
      style={styles.optionsScroll}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
    >
      {CATEGORIES.map((item) => (
        <Pressable
          key={item}
          style={styles.option}
          onPress={() => {
            setCategory(item);
            setCategoryMenuVisible(false);
          }}
        >
          <Text style={styles.optionText}>
            {item}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  </View>
) : null}

              {(category === "Veterinário" ||
                category === "Exame" ||
                category === "Outro") && (
                <>
                  <Text style={styles.label}>Observação</Text>

                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Ex: retorno, exame de sangue..."
                    placeholderTextColor="rgba(212, 233, 255, 0.45)"
                    multiline
                    maxLength={200}
                    style={[styles.input, styles.textArea]}
                  />
                </>
              )}

              <Pressable
                style={[
                  styles.saveButton,
                  loading && styles.disabledButton,
                ]}
                onPress={salvarNovoLembrete}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? "Salvando..." : "Salvar lembrete"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <CalendarioModal
        visible={calendarVisible}
        value={selectedDate}
        onChange={setSelectedDate}
        onClose={() => setCalendarVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerSubtitle: {
    color: "rgba(212, 233, 255, 0.55)",
    fontFamily: "MuseoModerno-Regular",
    fontSize: 14,
  },
  headerTitle: {
    color: TEXT,
    fontFamily: "MuseoModerno-Bold",
    fontSize: 25,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(212, 233, 255, 0.08)",
    borderRadius: 14,
    padding: 4,
    marginTop: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: ACCENT,
  },
  toggleText: {
    color: "rgba(212, 233, 255, 0.5)",
    fontFamily: "MuseoModerno-SemiBold",
    fontSize: 13,
  },
  toggleTextActive: {
    color: TEXT,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  weekInfo: {
    marginBottom: 18,
  },
  sectionLabel: {
    color: TEXT,
    fontFamily: "MuseoModerno-Bold",
    fontSize: 16,
    textTransform: "capitalize",
  },
  sectionDescription: {
    color: "rgba(212, 233, 255, 0.55)",
    fontFamily: "MuseoModerno-Regular",
    fontSize: 12,
    marginTop: 4,
  },
  calendarSection: {
    marginBottom: 18,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  monthTitle: {
    color: TEXT,
    fontFamily: "MuseoModerno-Bold",
    fontSize: 16,
    textTransform: "capitalize",
  },
  monthArrow: {
    color: TEXT,
    fontSize: 32,
    lineHeight: 32,
    paddingHorizontal: 12,
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  weekDay: {
    color: "rgba(212, 233, 255, 0.45)",
    fontFamily: "MuseoModerno-Bold",
    fontSize: 11,
    textAlign: "center",
    width: "14.28%",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    marginBottom: 3,
  },
  calendarDayOutside: {
    opacity: 0.3,
  },
  calendarDayWithReminder: {
    backgroundColor: "rgba(51, 102, 153, 0.35)",
  },
  calendarDaySelected: {
    backgroundColor: ACCENT,
  },
  calendarDayToday: {
    borderWidth: 1,
    borderColor: TEXT,
  },
  calendarDayText: {
    color: TEXT,
    fontFamily: "MuseoModerno-Medium",
    fontSize: 12,
  },
  reminderDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TEXT,
    marginTop: 2,
  },
  clearSelectionButton: {
    alignItems: "center",
    marginTop: 10,
  },
  clearSelectionText: {
    color: "rgba(212, 233, 255, 0.6)",
    fontFamily: "MuseoModerno-Regular",
    fontSize: 12,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TEXT,
    borderRadius: 16,
    padding: 13,
    marginBottom: 12,
  },
  dateBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  dateNumber: {
    color: TEXT,
    fontFamily: "MuseoModerno-Bold",
    fontSize: 16,
  },
  dateMonth: {
    color: TEXT,
    fontFamily: "MuseoModerno-Regular",
    fontSize: 9,
    textTransform: "uppercase",
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    color: ACCENT,
    fontFamily: "MuseoModerno-Bold",
    fontSize: 13,
  },
  reminderMeta: {
    color: "rgba(51, 102, 153, 0.7)",
    fontFamily: "MuseoModerno-Regular",
    fontSize: 11,
    marginTop: 3,
    textTransform: "capitalize",
  },
  reminderNote: {
    color: "rgba(51, 102, 153, 0.65)",
    fontFamily: "MuseoModerno-Regular",
    fontSize: 11,
    marginTop: 5,
  },
  deleteButton: {
    padding: 7,
  },
  deleteButtonText: {
    color: ACCENT,
    fontSize: 25,
    lineHeight: 25,
  },
  emptyText: {
    color: "rgba(212, 233, 255, 0.45)",
    fontFamily: "MuseoModerno-Regular",
    textAlign: "center",
    marginTop: 45,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    zIndex: 5,
  },
  fabText: {
    color: TEXT,
    fontSize: 32,
    fontFamily: "MuseoModerno-Regular",
    lineHeight: 35,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(20, 28, 36, 0.75)",
  },
  modalContent: {
    maxHeight: "90%",
    backgroundColor: BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: {
    color: TEXT,
    fontFamily: "MuseoModerno-Bold",
    fontSize: 19,
  },
  closeButton: {
    color: TEXT,
    fontSize: 30,
    lineHeight: 30,
  },
  label: {
    color: "rgba(212, 233, 255, 0.7)",
    fontFamily: "MuseoModerno-SemiBold",
    fontSize: 13,
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(212, 233, 255, 0.18)",
    borderRadius: 13,
    paddingHorizontal: 14,
    color: TEXT,
    fontFamily: "MuseoModerno-Regular",
    backgroundColor: "rgba(51, 102, 153, 0.15)",
  },
  textArea: {
    height: 85,
    paddingTop: 13,
    textAlignVertical: "top",
  },
  selectInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "rgba(212, 233, 255, 0.18)",
    borderRadius: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(51, 102, 153, 0.15)",
  },
  selectText: {
    color: TEXT,
    fontFamily: "MuseoModerno-Regular",
    flex: 1,
  },
  placeholderText: {
    color: "rgba(212, 233, 255, 0.45)",
  },
  selectArrow: {
    color: TEXT,
    fontSize: 18,
  },
  optionsContainer: {
    maxHeight: 190,
  borderWidth: 1,
  borderColor: "rgba(212, 233, 255, 0.18)",
  borderRadius: 12,
  marginTop: 6,
  backgroundColor: "#2A3A4A",
  overflow: "hidden",
  },
  option: {
  minHeight: 48,
  paddingVertical: 12,
  paddingHorizontal: 14,
  justifyContent: "center",
  borderBottomWidth: 1,
  borderBottomColor: "rgba(212, 233, 255, 0.1)",
  },
  optionsScroll: {
  maxHeight: 190,
},
  optionText: {
color: TEXT,
  fontFamily: "MuseoModerno-Regular",
  fontSize: 14,
  },
  emptyOption: {
    color: "rgba(212, 233, 255, 0.55)",
    padding: 14,
    fontFamily: "MuseoModerno-Regular",
  },
  saveButton: {
    backgroundColor: TEXT,
    borderRadius: 15,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 15,
  },
  saveButtonText: {
    color: BG,
    fontFamily: "MuseoModerno-Bold",
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.55,
  },
});

export default PaginaDeAgenda;