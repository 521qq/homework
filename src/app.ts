import express, { Request, Response } from 'express';
import moment from 'moment-timezone';
import { find } from 'geo-tz';

const app = express();

app.use((req, _, next) => {
  console.log(`request received: ${req.method} ${req.url}`);
  next();
});

app.get('/months', (req: Request, res: Response) => {
  const { lon, lat, from, to } = req.query;

  if (!lon || !lat || !from || !to) {
    return res.status(400).json({ error: 'parameters Missing' });
  }

  const longitude = parseFloat(lon as string);
  const latitude = parseFloat(lat as string);

  if (isNaN(longitude) || isNaN(latitude)) {
    return res.status(400).json({ error: 'longitude or latitude isNaN' });
  }

  const fromDate = moment(from as string, 'YYYY-MM');
  const toDate = moment(to as string, 'YYYY-MM');

  if (!fromDate.isValid() || !toDate.isValid()) {
    return res.status(400).json({ error: 'invalid date format' });
  }

  const timezones = find(latitude, longitude);
  if (timezones.length === 0) {
    return res.status(400).json({ error: 'can not find correct timezone' });
  }
  console.log('timezones', timezones);
  const timezone = timezones[0];

  const startDate = moment.tz(`${from}-01`, 'YYYY-MM-DD', timezone);
  // console.log(moment.tz(`${from}-01`, timezone).format(), moment.tz(`${from}-01`, timezone).utc().format());
  // console.log(moment.tz(`2024-05-01`, timezone).format(), moment.tz(`2024-05-01`, timezone).utc().format());
  const endDate = moment.tz(`${to}-01`, 'YYYY-MM-DD', timezone);

  if (!startDate.isValid() || !endDate.isValid()) {
    return res.status(400).json({ error: 'startDate or endDate is not valid' });
  }

  const monthStarts: string[] = [];
  let currentDate = startDate.clone();

  while (currentDate.isSameOrBefore(endDate)) {
    const nextMonth = currentDate.month() + 1;
    const thisYear = currentDate.year();
    // console.log('current month1', currentDate.month());
    // console.log('to push', currentDate.format(), '' + currentDate.utc().format());
    // console.log('current month2', currentDate.month());
    monthStarts.push(currentDate.utc().format());
    // console.log('next', nextMonth);
    const nextYear = nextMonth > 11 ? thisYear + 1 : thisYear;
    currentDate = moment.tz(
      {
        year: nextYear,
        month: nextMonth % 12,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
      },
      timezone
    );
    // console.log('next currentDate', currentDate);
  }

  res.json({ monthStarts });
});
export default app;
