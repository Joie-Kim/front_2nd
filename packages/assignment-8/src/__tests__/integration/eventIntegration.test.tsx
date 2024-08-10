import { act, renderHook } from '@testing-library/react-hooks';
import { useEvents } from '../../hooks/useEvents';
import { ReactNode, useEffect } from 'react';
import userEvent from '@testing-library/user-event';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { SchedulerProvider } from '../../contexts/SchedulerContext';
import { EventFormData } from '../../types';
import App from '../../App';

const setup = (component: ReactNode) => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  return {
    user,
    ...render(<SchedulerProvider>{component}</SchedulerProvider>),
  };
};

test('이벤트 생성 시 상태가 올바르게 업데이트되는지 확인', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useEvents());

  const newEvent: EventFormData = {
    id: 1,
    title: '팀 회의',
    date: '2024-07-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { isRepeating: false, type: 'none', interval: 1 },
    notificationTime: 1,
  };

  act(() => {
    result.current.addEvent(newEvent);
  });

  await waitForNextUpdate();

  expect(result.current.events).toHaveLength(1);
  expect(result.current.events[0].title).toBe('팀 회의');
});

test('이벤트 검색 기능이 올바르게 작동하는지 확인', async () => {
  const { getByLabelText, getByTestId } = setup(<App />);
  const searchInput = getByLabelText('일정 검색');
  const eventList = getByTestId('event-list');

  const getEventElements = () => {
    const allElements = within(eventList).queryAllByTestId(/^event-/);
    return allElements.filter((element) => {
      const testId = element.getAttribute('data-testid');
      return testId && /^event-\d+$/.test(testId);
    });
  };

  // 모든 이벤트가 로드될 때까지 대기
  await waitFor(() => {
    const initialEvents = getEventElements();
    expect(initialEvents.length).toBeGreaterThan(0);
  });

  const getEventCount = () => getEventElements().length;

  const initialCount = getEventCount();

  // '팀' 검색
  fireEvent.change(searchInput, { target: { value: '팀' } });
  await waitFor(() => {
    const teamEventsCount = getEventCount();
    expect(teamEventsCount).toBeGreaterThan(0);
    expect(teamEventsCount).toBeLessThanOrEqual(initialCount);
  });

  // '생일' 검색
  fireEvent.change(searchInput, { target: { value: '생일' } });
  await waitFor(() => {
    const birthdayEventsCount = getEventCount();
    expect(birthdayEventsCount).toBe(1);
  });

  // 검색어 지우기
  fireEvent.change(searchInput, { target: { value: '' } });
  await waitFor(() => {
    const allEventsCount = getEventCount();
    expect(allEventsCount).toBe(initialCount);
  });
});

test('이벤트 충돌 시 경고 다이얼로그 표시', async () => {
  const { user } = setup(<App />);

  // 일정 입력 필드들을 찾습니다
  const titleInput = screen.getByLabelText('제목');
  const dateInput = screen.getByLabelText('날짜');
  const startTimeInput = screen.getByLabelText('시작 시간');
  const endTimeInput = screen.getByLabelText('종료 시간');

  // 새로운 일정 정보를 입력합니다
  await user.type(titleInput, '새 회의');
  await user.type(dateInput, '2024-07-20');
  await user.type(startTimeInput, '10:30');
  await user.type(endTimeInput, '11:30');

  // 일정 등록 버튼을 클릭합니다
  const submitButton = screen.getByTestId('event-submit-button');
  await user.click(submitButton);

  // 경고 대화상자가 나타나는지 확인합니다
  const alertDialog = await screen.findByRole('alertdialog');
  expect(alertDialog).toBeInTheDocument();

  // 경고 대화상자에 "일정 겹침 경고" 텍스트가 있는지 확인합니다
  expect(within(alertDialog).getByText('일정 겹침 경고')).toBeInTheDocument();

  // 충돌된 일정 정보가 표시되는지 확인합니다
  expect(alertDialog).toHaveTextContent('팀 회의');
  expect(alertDialog).toHaveTextContent('2024-07-20');
  expect(alertDialog).toHaveTextContent('10:00');
  expect(alertDialog).toHaveTextContent('11:00');
});
