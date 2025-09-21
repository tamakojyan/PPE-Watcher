import { useState } from 'react';
import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';

type DateRangePickerProps = {
  onChange: (range: { from?: number; to?: number }) => void;
};

export default function DateRangePicker({ onChange }: DateRangePickerProps) {
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  const handleFromChange = (newValue: Dayjs | null) => {
    setFromDate(newValue);
    onChange({
      from: newValue ? newValue.startOf('day').valueOf() : undefined,
      to: toDate ? toDate.endOf('day').valueOf() : undefined,
    });
  };

  const handleToChange = (newValue: Dayjs | null) => {
    setToDate(newValue);
    onChange({
      from: fromDate ? fromDate.startOf('day').valueOf() : undefined,
      to: newValue ? newValue.endOf('day').valueOf() : undefined,
    });
  };

  return (
    <>
      <Grid size={{ md: 3 }}>
        <DatePicker
          label="From"
          value={fromDate}
          onChange={handleFromChange}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </Grid>
      <Grid size={{ md: 3 }}>
        <DatePicker
          label="To"
          value={toDate}
          onChange={handleToChange}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </Grid>
    </>
  );
}
