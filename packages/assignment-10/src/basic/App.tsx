import { ScheduleProvider } from './ScheduleContext.tsx';
import { ScheduleTables } from './ScheduleTables.tsx';

function App() {
  return (
    <ScheduleProvider>
      <ScheduleTables />
    </ScheduleProvider>
  );
}

export default App;
