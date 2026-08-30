import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.wordmark}>UNLABELED</Text>
        <Text style={styles.issue}>FIELD GUIDE / 001</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>BEFORE FRESHMAN FALL</Text>
        <Text style={styles.title}>Choose the work before the label.</Text>
        <Text style={styles.body}>
          Four short challenges. No major names. A campus plan built from what
          actually makes you curious.
        </Text>
      </View>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>BEGIN DISCOVERY</Text>
        <Text style={styles.arrow}>→</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F1E8',
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1B1B19',
  },
  wordmark: {
    color: '#1B1B19',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  issue: {
    color: '#66635B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 54,
  },
  eyebrow: {
    color: '#D94E34',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 18,
  },
  title: {
    color: '#171715',
    fontSize: 58,
    lineHeight: 59,
    fontWeight: '800',
    letterSpacing: -2.8,
    maxWidth: 350,
  },
  body: {
    color: '#4E4C46',
    fontSize: 17,
    lineHeight: 25,
    marginTop: 26,
    maxWidth: 330,
  },
  button: {
    minHeight: 62,
    backgroundColor: '#1B1B19',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#F4F1E8',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  arrow: {
    color: '#F4F1E8',
    fontSize: 24,
  },
});
