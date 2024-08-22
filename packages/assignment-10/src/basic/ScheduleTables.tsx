import { useCallback, useState, memo } from 'react';
import { Button, ButtonGroup, Flex, Heading, Stack } from '@chakra-ui/react';
import ScheduleTable from './ScheduleTable';
import { useScheduleContext } from './ScheduleContext';
import SearchDialog from './SearchDialog';
import { TableProvider, useTableContext } from './TableContext';
import ScheduleDndProvider from './ScheduleDndProvider';

interface ScheduleTableWrapperProps {
  tableId: string;
  index: number;
  setSearchInfo: (
    info: { tableId: string; day?: string; time?: number } | null
  ) => void;
}

const ScheduleTableContent = ({
  tableId,
  index,
  setSearchInfo,
}: ScheduleTableWrapperProps) => {
  const { removeTable } = useScheduleContext();
  const { schedules, updateSchedule } = useTableContext();

  const handleScheduleTimeClick = useCallback(
    (timeInfo: { day: string; time: number }) => {
      setSearchInfo({ tableId, ...timeInfo });
    },
    [tableId, setSearchInfo]
  );

  const handleDeleteButtonClick = useCallback(
    ({ day, time }: { day: string; time: number }) => {
      const updatedSchedules = schedules.filter(
        (schedule) => schedule.day !== day || !schedule.range.includes(time)
      );
      updateSchedule(updatedSchedules);
    },
    [schedules, updateSchedule]
  );

  return (
    <Stack key={tableId} width='600px'>
      <Flex justifyContent='space-between' alignItems='center'>
        <Heading as='h3' fontSize='lg'>
          시간표 {index + 1}
        </Heading>
        <ButtonGroup size='sm' isAttached>
          <Button
            colorScheme='green'
            onClick={() => setSearchInfo({ tableId })}
          >
            시간표 추가
          </Button>
          <Button colorScheme='green' onClick={() => removeTable(tableId)}>
            삭제
          </Button>
        </ButtonGroup>
      </Flex>
      <ScheduleTable
        schedules={schedules}
        tableId={tableId}
        onScheduleTimeClick={handleScheduleTimeClick}
        onDeleteButtonClick={handleDeleteButtonClick}
      />
    </Stack>
  );
};

const ScheduleTableWrapper = ({
  tableId,
  index,
  setSearchInfo,
}: ScheduleTableWrapperProps) => {
  return (
    <TableProvider tableId={tableId}>
      <ScheduleDndProvider>
        <ScheduleTableContent
          tableId={tableId}
          index={index}
          setSearchInfo={setSearchInfo}
        />
      </ScheduleDndProvider>
    </TableProvider>
  );
};

export const ScheduleTables = () => {
  const { tableIds, addTable } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const handleAddTable = useCallback(() => {
    const newTableId = `schedule-${Date.now()}`;
    addTable(newTableId);
  }, [addTable]);

  return (
    <>
      <Flex w='full' gap={6} p={6} flexWrap='wrap'>
        {tableIds.map((tableId, index) => (
          <ScheduleTableWrapper
            key={tableId}
            tableId={tableId}
            index={index}
            setSearchInfo={setSearchInfo}
          />
        ))}
        <Button onClick={handleAddTable}>새 시간표 추가</Button>
      </Flex>
      {searchInfo && (
        <SearchDialog
          searchInfo={searchInfo}
          onClose={() => setSearchInfo(null)}
        />
      )}
    </>
  );
};

export default ScheduleTables;
