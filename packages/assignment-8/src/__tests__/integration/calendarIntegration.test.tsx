import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { SchedulerProvider } from '../../contexts/SchedulerContext';
import CalendarView from '../../components/CalendarView';

const setup = (component: ReactNode) => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  return {
    user,
    ...render(<SchedulerProvider>{component}</SchedulerProvider>),
  };
};

test('캘린더 뷰 변경 시 해당 기간의 이벤트만 표시', async () => {
  const { getByLabelText, getAllByTestId } = setup(<CalendarView />);
  const viewSelect = getByLabelText('view');

  // 주간 뷰로 변경
  fireEvent.change(viewSelect, { target: { value: 'week' } });
  const weekEventCells = getAllByTestId(/^week-cell-/);
  const weekEvents = weekEventCells.flatMap((cell) =>
    cell.querySelectorAll('[data-testid^="event-"]')
  );
  expect(weekEvents.length).toBeGreaterThan(0); // 주간 이벤트가 있는지 확인

  // 월간 뷰로 변경
  fireEvent.change(viewSelect, { target: { value: 'month' } });
  const monthEventCells = getAllByTestId(/^month-cell-/);
  const monthEvents = monthEventCells.flatMap((cell) =>
    cell.querySelectorAll('[data-testid^="event-"]')
  );
  expect(monthEvents.length).toBeGreaterThan(0); // 월간 이벤트가 있는지 확인

  // 월간 이벤트 수가 주간 이벤트 수보다 많은지 확인
  expect(monthEvents.length).toBeGreaterThan(weekEvents.length);
});
