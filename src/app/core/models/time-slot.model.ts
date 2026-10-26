export interface TimeSlot {
  text: string;
  done: boolean;
  flag: boolean;
}

export interface TimeSlotEntry {
  time: string;       // "09:00"
  endTime: string;    // "09:30"
  slot: TimeSlot;
}
