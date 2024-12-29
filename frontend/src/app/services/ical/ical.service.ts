import { Injectable } from '@angular/core';
import { IcalEvent } from '../../models/data_interfaces';

@Injectable({
  providedIn: 'root',
})
export class IcalService {
  constructor() {}
}

export const createEvent = (events: IcalEvent[]) => {
  const formatDate = (date: Date): string => {
    if (!date) {
      return '';
    }
    // don't use date.toISOString() here, it will be always one day off (cause of the timezone)
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const month =
      date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const minutes =
      date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const seconds =
      date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return `${year}${month}${day}T${hour}${minutes}${seconds}`;
  };

  let VCALENDAR = `BEGIN:VCALENDAR
PRODID:-//Events Calendar//HSHSOFT 1.0//DE
VERSION:2.0
`;
  for (const event of events) {
    const timeStamp = formatDate(new Date());
    // create a unique identifier for the event
    const uuid = `${event.title}-${event.start}-${event.end || ''}`;

    // Calculate default end time if not provided
    const defaultEnd = new Date(event.start);
    defaultEnd.setMinutes(defaultEnd.getMinutes() + 90);

    const EVENT = `BEGIN:VEVENT
DTSTAMP:${timeStamp}Z
DTSTART:${formatDate(event.start)}
DTEND:${formatDate(event.end || defaultEnd)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
URL:${event.url || ''}
UID:${uuid}
END:VEVENT`;
    VCALENDAR += `${EVENT}
`;
  }
  VCALENDAR += `END:VCALENDAR`;

  return VCALENDAR;
};
