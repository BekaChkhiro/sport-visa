/**
 * Demo database seed.
 *
 * Populates the dev database with a rich, realistic set of Georgian clubs and
 * footballers plus the social relations (posts, subscriptions, shortlists,
 * conversations, notifications, service requests) needed to exercise every
 * page of the site at once.
 *
 * Idempotent & non-destructive: it only ever touches accounts whose email ends
 * with `@demo.ge`. Every run deletes those demo accounts first (cascades wipe
 * their profiles/posts/etc.) and recreates them, so re-running is safe and any
 * real accounts in the database are left completely untouched. Existing
 * reference data (leagues, service categories) is reused, never recreated.
 *
 * Usage:
 *   npm run db:seed:demo
 *   # or: npx dotenv -e .env.local -- npx tsx prisma/seed-demo.ts
 *
 * Every demo account shares the password below — log in as any of them to
 * explore the dashboards from each role's perspective.
 */

import { fileURLToPath } from 'node:url';
import { PrismaClient, type Position } from '@prisma/client';
import bcrypt from 'bcryptjs';

const DEMO_DOMAIN = '@demo.ge';
const DEMO_PASSWORD = 'Demo123!';

// ── Demo data ─────────────────────────────────────────────────────────────────

type ClubSeed = {
  email: string;
  name: string;
  city: string;
  league: string;
  foundedYear: number;
  website: string;
  stadiumName: string;
  stadiumCapacity: number;
  bio: string;
  verified: boolean;
  history: { year: number; title: string; description: string }[];
  roster: { playerName: string; position: string; jerseyNumber: number }[];
  posts: { title: string; body: string }[];
};

const POS = (p: string) => p as Position;

const CLUBS: ClubSeed[] = [
  {
    email: `club1${DEMO_DOMAIN}`,
    name: 'დინამო თბილისი',
    city: 'თბილისი',
    league: 'ეროვნული ლიგა',
    foundedYear: 1925,
    website: 'https://fcdinamo.ge',
    stadiumName: 'ბორის პაიჭაძის დინამო არენა',
    stadiumCapacity: 54549,
    bio: 'საქართველოს ყველაზე ტიტულოვანი საფეხბურთო კლუბი, დაარსებული 1925 წელს. მრავალგზის ჩემპიონი და 1981 წლის თასების მფლობელთა თასის გამარჯვებული.',
    verified: true,
    history: [
      { year: 1925, title: 'კლუბის დაარსება', description: 'დინამო თბილისი დაარსდა 1925 წელს.' },
      {
        year: 1981,
        title: 'თასების მფლობელთა თასი',
        description: 'ევროპული ტროფის მოგება კარლ ცაისის დამარცხებით.',
      },
      {
        year: 2022,
        title: 'ეროვნული ლიგის ჩემპიონი',
        description: 'მორიგი ჩემპიონობა ეროვნულ ლიგაში.',
      },
    ],
    roster: [
      { playerName: 'ლუკა გაგნიძე', position: 'CM', jerseyNumber: 8 },
      { playerName: 'საბა ლობჟანიძე', position: 'RW', jerseyNumber: 7 },
      { playerName: 'ნიკა გაგნიძე', position: 'CB', jerseyNumber: 4 },
      { playerName: 'გიორგი მამარდაშვილი', position: 'GK', jerseyNumber: 1 },
      { playerName: 'ბექა მიქელტაძე', position: 'ST', jerseyNumber: 9 },
      { playerName: 'დათო ხოჭოლავა', position: 'LB', jerseyNumber: 3 },
    ],
    posts: [
      {
        title: 'ახალი სეზონის სტარტი',
        body: 'ჩვენი გუნდი ემზადება ახალი სეზონისთვის. წინ ბევრი საინტერესო მატჩი გველოდება — დაუჭირეთ მხარი!',
      },
      {
        title: 'ბილეთები ხელმისაწვდომია',
        body: 'მომავალი დერბისთვის ბილეთები უკვე იყიდება ოფიციალურ საიტზე. დაასწარით!',
      },
      {
        title: 'ახალგაზრდული აკადემიის მიღება',
        body: 'ვიწყებთ ახალგაზრდა ფეხბურთელთა მიღებას აკადემიაში. ასაკი 8-დან 14 წლამდე.',
      },
    ],
  },
  {
    email: `club2${DEMO_DOMAIN}`,
    name: 'დინამო ბათუმი',
    city: 'ბათუმი',
    league: 'ეროვნული ლიგა',
    foundedYear: 1980,
    website: 'https://dinamobatumi.com',
    stadiumName: 'ბათუმის სტადიონი',
    stadiumCapacity: 20000,
    bio: 'ბათუმის წამყვანი კლუბი, ბოლო წლების ეროვნული ლიგის ჩემპიონი და სტაბილური ევროპული მონაწილე.',
    verified: true,
    history: [
      { year: 1980, title: 'დაარსება', description: 'კლუბი დაარსდა ბათუმში.' },
      {
        year: 2021,
        title: 'ეროვნული ლიგის ჩემპიონი',
        description: 'პირველი ჩემპიონობა კლუბის ისტორიაში.',
      },
    ],
    roster: [
      { playerName: 'გიორგი გელაშვილი', position: 'GK', jerseyNumber: 1 },
      { playerName: 'ზურა ჯავახიშვილი', position: 'CB', jerseyNumber: 5 },
      { playerName: 'ირაკლი სიხარულიძე', position: 'CM', jerseyNumber: 6 },
      { playerName: 'დავით ვოლკოვი', position: 'CF', jerseyNumber: 10 },
      { playerName: 'ნოდარ კავთარაძე', position: 'RB', jerseyNumber: 2 },
    ],
    posts: [
      {
        title: 'ევროპული მატჩის ანონსი',
        body: 'მომავალ კვირას ვმასპინძლობთ ევროპულ ოპონენტს. სტადიონი მზადაა, ველოდებით მხარდამჭერებს.',
      },
      { title: 'ახალი ტრანსფერი', body: 'გუნდს შემოუერთდა გამოცდილი ცენტრალური თავდამცველი.' },
    ],
  },
  {
    email: `club3${DEMO_DOMAIN}`,
    name: 'ტორპედო ქუთაისი',
    city: 'ქუთაისი',
    league: 'ეროვნული ლიგა',
    foundedYear: 1946,
    website: 'https://torpedo.ge',
    stadiumName: 'რამაზ შენგელიას სახელობის ცენტრალური სტადიონი',
    stadiumCapacity: 24500,
    bio: 'ქუთაისის ისტორიული კლუბი მდიდარი ტრადიციებითა და ერთგული მხარდამჭერებით.',
    verified: true,
    history: [
      { year: 1946, title: 'დაარსება', description: 'კლუბი დაარსდა ქუთაისში.' },
      { year: 2017, title: 'ჩემპიონობა', description: 'ეროვნული ლიგის მოგება.' },
    ],
    roster: [
      { playerName: 'ალექსი ქობახიძე', position: 'AM', jerseyNumber: 10 },
      { playerName: 'გიორგი არაბიძე', position: 'LW', jerseyNumber: 11 },
      { playerName: 'ბექა გოცირიძე', position: 'DM', jerseyNumber: 6 },
      { playerName: 'სანდრო ღლონტი', position: 'CB', jerseyNumber: 4 },
    ],
    posts: [
      {
        title: 'სეზონის გახსნა',
        body: 'ვხსნით ახალ სეზონს მშობლიურ სტადიონზე. მოდით და დაუჭირეთ გუნდს მხარი!',
      },
    ],
  },
  {
    email: `club4${DEMO_DOMAIN}`,
    name: 'საბურთალო',
    city: 'თბილისი',
    league: 'ეროვნული ლიგა',
    foundedYear: 1999,
    website: 'https://saburtalo.ge',
    stadiumName: 'ბენდელა არენა',
    stadiumCapacity: 6000,
    bio: 'თანამედროვე კლუბი ძლიერი აკადემიითა და ახალგაზრდებზე ორიენტირებული ფილოსოფიით.',
    verified: true,
    history: [
      { year: 1999, title: 'დაარსება', description: 'კლუბი დაარსდა თბილისში.' },
      { year: 2018, title: 'ჩემპიონობა', description: 'პირველი ეროვნული ლიგის ტიტული.' },
    ],
    roster: [
      { playerName: 'ლაშა ოდიშარია', position: 'ST', jerseyNumber: 9 },
      { playerName: 'გიორგი კუხილავა', position: 'RW', jerseyNumber: 7 },
      { playerName: 'დემეტრე გელ', position: 'CM', jerseyNumber: 8 },
    ],
    posts: [
      { title: 'აკადემიის წარმატება', body: 'ჩვენი U19 გუნდი გავიდა ფინალში. გილოცავთ ბიჭებო!' },
      { title: 'ახალი მწვრთნელი', body: 'გუნდს ჩაუდგა სათავეში ახალი მთავარი მწვრთნელი.' },
    ],
  },
  {
    email: `club5${DEMO_DOMAIN}`,
    name: 'დილა გორი',
    city: 'გორი',
    league: 'ეროვნული ლიგა',
    foundedYear: 1936,
    website: 'https://dilagori.ge',
    stadiumName: 'თენგიზ ბურჯანაძის სტადიონი',
    stadiumCapacity: 3000,
    bio: 'გორის წარმომადგენელი ეროვნულ ლიგაში, ცნობილი ბრძოლისუნარიანი თამაშით.',
    verified: true,
    history: [
      { year: 1936, title: 'დაარსება', description: 'კლუბი დაარსდა გორში.' },
      { year: 2016, title: 'ჩემპიონობა', description: 'ისტორიული ჩემპიონობა.' },
    ],
    roster: [
      { playerName: 'ირაკლი წილოსანი', position: 'CB', jerseyNumber: 5 },
      { playerName: 'გიორგი პაპავა', position: 'LB', jerseyNumber: 3 },
      { playerName: 'ნიკა ქვარაია', position: 'ST', jerseyNumber: 9 },
    ],
    posts: [
      {
        title: 'მადლობა გულშემატკივრებს',
        body: 'მადლობა ყველას, ვინც ბოლო მატჩზე გვერდით გვედგა.',
      },
    ],
  },
  {
    email: `club6${DEMO_DOMAIN}`,
    name: 'ლოკომოტივი თბილისი',
    city: 'თბილისი',
    league: 'კრისტალი ლიგა',
    foundedYear: 1936,
    website: 'https://lokomotivi.ge',
    stadiumName: 'მიხეილ მესხის სტადიონი',
    stadiumCapacity: 24680,
    bio: 'დედაქალაქის ერთ-ერთი უძველესი კლუბი მდიდარი ისტორიით.',
    verified: true,
    history: [{ year: 1936, title: 'დაარსება', description: 'კლუბი დაარსდა თბილისში.' }],
    roster: [
      { playerName: 'ვახო ქადეიშვილი', position: 'GK', jerseyNumber: 1 },
      { playerName: 'ლევან ხმალაძე', position: 'CM', jerseyNumber: 8 },
      { playerName: 'გიორგი ბერია', position: 'AM', jerseyNumber: 10 },
    ],
    posts: [
      {
        title: 'ლიგაში დაბრუნება',
        body: 'ვიბრძვით უმაღლეს ლიგაში დასაბრუნებლად. გვერდით დაგვიდექით!',
      },
    ],
  },
  {
    email: `club7${DEMO_DOMAIN}`,
    name: 'სიონი ბოლნისი',
    city: 'ბოლნისი',
    league: 'კრისტალი ლიგა',
    foundedYear: 1936,
    website: 'https://sioni.ge',
    stadiumName: 'ტემურ სტეფანიას სტადიონი',
    stadiumCapacity: 3500,
    bio: 'ბოლნისის წარმომადგენელი, 2006 წლის ეროვნული ლიგის ჩემპიონი.',
    verified: true,
    history: [{ year: 2006, title: 'ჩემპიონობა', description: 'ისტორიული ეროვნული ლიგის ტიტული.' }],
    roster: [
      { playerName: 'რევაზ ბერიძე', position: 'RB', jerseyNumber: 2 },
      { playerName: 'თორნიკე გორგაძე', position: 'CB', jerseyNumber: 4 },
    ],
    posts: [
      {
        title: 'სასწავლო-საწვრთნელი შეკრება',
        body: 'გუნდი გაემგზავრა სასწავლო-საწვრთნელ შეკრებაზე სეზონის წინ.',
      },
    ],
  },
  {
    email: `club8${DEMO_DOMAIN}`,
    name: 'სამგურალი წყალტუბო',
    city: 'წყალტუბო',
    league: 'კრისტალი ლიგა',
    foundedYear: 1945,
    website: 'https://samgurali.ge',
    stadiumName: 'წყალტუბოს ცენტრალური სტადიონი',
    stadiumCapacity: 6000,
    bio: 'წყალტუბოს კლუბი, რომელიც ბოლო წლებში სტაბილურად იბრძვის უმაღლეს ლიგაში.',
    verified: true,
    history: [{ year: 1945, title: 'დაარსება', description: 'კლუბი დაარსდა წყალტუბოში.' }],
    roster: [
      { playerName: 'გიორგი ცქიტიშვილი', position: 'LW', jerseyNumber: 11 },
      { playerName: 'დავით ნადირაძე', position: 'DM', jerseyNumber: 6 },
    ],
    posts: [
      {
        title: 'ახალი ფორმა',
        body: 'წარმოგიდგენთ ახალი სეზონის ფორმას. იხილეთ ფოტოები ოფიციალურ გვერდზე.',
      },
    ],
  },
  // Two pending clubs — they appear in the admin verification queue, not the public directory.
  {
    email: `club9${DEMO_DOMAIN}`,
    name: 'ფ.კ. ტელავი',
    city: 'თელავი',
    league: 'კრისტალი ლიგა',
    foundedYear: 1936,
    website: 'https://fctelavi.ge',
    stadiumName: 'გივი ჭოხონელიძის სტადიონი',
    stadiumCapacity: 6000,
    bio: 'კახეთის რეგიონის წარმომადგენელი კლუბი.',
    verified: false,
    history: [{ year: 1936, title: 'დაარსება', description: 'კლუბი დაარსდა თელავში.' }],
    roster: [{ playerName: 'ზაზა ჩხეიძე', position: 'ST', jerseyNumber: 9 }],
    posts: [],
  },
  {
    email: `club10${DEMO_DOMAIN}`,
    name: 'ფ.კ. გაგრა',
    city: 'თბილისი',
    league: 'კრისტალი ლიგა',
    foundedYear: 1992,
    website: 'https://fcgagra.ge',
    stadiumName: 'მიხეილ მესხის სტადიონი',
    stadiumCapacity: 24680,
    bio: 'აფხაზეთიდან დევნილი კლუბი, რომელიც თბილისში ასპარეზობს.',
    verified: false,
    history: [{ year: 1992, title: 'დაარსება', description: 'კლუბი დაარსდა გაგრაში.' }],
    roster: [{ playerName: 'ბექა ცინცაძე', position: 'CM', jerseyNumber: 8 }],
    posts: [],
  },
];

type FootballerSeed = {
  email: string;
  firstName: string;
  lastName: string;
  city: string;
  age: number;
  positions: Position[];
  height: number;
  weight: number;
  foot: 'RIGHT' | 'LEFT' | 'BOTH';
  experience: 'PROFESSIONAL' | 'SEMI_PROFESSIONAL' | 'AMATEUR';
  currentClub: string;
  jerseyNumber: number;
  bio: string;
  desiredLeague: string;
  agentName: string;
  verified: boolean;
  career: { clubName: string; startYear: number; endYear: number | null; position: Position }[];
  videoLinks: string[];
};

const FOOTBALLERS: FootballerSeed[] = [
  {
    email: `player1${DEMO_DOMAIN}`,
    firstName: 'გიორგი',
    lastName: 'ბერიძე',
    city: 'თბილისი',
    age: 24,
    positions: [POS('ST'), POS('CF')],
    height: 185,
    weight: 78,
    foot: 'RIGHT',
    experience: 'PROFESSIONAL',
    currentClub: 'დინამო თბილისი',
    jerseyNumber: 9,
    bio: 'მებრძოლი თავდამსხმელი, ძლიერი დარტყმითა და კარგი თამაშის წაკითხვის უნარით. ვეძებ ახალ გამოწვევას.',
    desiredLeague: 'Premier League',
    agentName: 'ლევან აგენტი',
    verified: true,
    career: [
      { clubName: 'საბურთალო', startYear: 2018, endYear: 2021, position: POS('ST') },
      { clubName: 'დინამო თბილისი', startYear: 2021, endYear: null, position: POS('ST') },
    ],
    videoLinks: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
  },
  {
    email: `player2${DEMO_DOMAIN}`,
    firstName: 'ნიკა',
    lastName: 'მაისურაძე',
    city: 'ბათუმი',
    age: 21,
    positions: [POS('LW'), POS('RW')],
    height: 176,
    weight: 70,
    foot: 'LEFT',
    experience: 'PROFESSIONAL',
    currentClub: 'დინამო ბათუმი',
    jerseyNumber: 11,
    bio: 'სწრაფი ფლანგის მოთამაშე დრიბლინგისა და გასარღვევი პასების უნარით.',
    desiredLeague: 'La Liga',
    agentName: 'ზაზა მენეჯერი',
    verified: true,
    career: [{ clubName: 'დინამო ბათუმი', startYear: 2020, endYear: null, position: POS('LW') }],
    videoLinks: [],
  },
  {
    email: `player3${DEMO_DOMAIN}`,
    firstName: 'ლუკა',
    lastName: 'კვირკველია',
    city: 'ქუთაისი',
    age: 27,
    positions: [POS('CB')],
    height: 190,
    weight: 84,
    foot: 'RIGHT',
    experience: 'PROFESSIONAL',
    currentClub: 'ტორპედო ქუთაისი',
    jerseyNumber: 4,
    bio: 'გამოცდილი ცენტრალური თავდამცველი, ლიდერი მოედანზე, ძლიერი საჰაერო ბრძოლაში.',
    desiredLeague: 'Serie A',
    agentName: 'დათო წარმომადგენელი',
    verified: true,
    career: [
      { clubName: 'დილა გორი', startYear: 2015, endYear: 2019, position: POS('CB') },
      { clubName: 'ტორპედო ქუთაისი', startYear: 2019, endYear: null, position: POS('CB') },
    ],
    videoLinks: [],
  },
  {
    email: `player4${DEMO_DOMAIN}`,
    firstName: 'საბა',
    lastName: 'ჩხაიძე',
    city: 'თბილისი',
    age: 19,
    positions: [POS('AM'), POS('CM')],
    height: 178,
    weight: 71,
    foot: 'RIGHT',
    experience: 'SEMI_PROFESSIONAL',
    currentClub: 'საბურთალო',
    jerseyNumber: 10,
    bio: 'შემოქმედებითი ნახევარმცველი, კარგი ხედვითა და ფინალური პასით. აკადემიის აღზრდილი.',
    desiredLeague: 'Bundesliga',
    agentName: 'გიორგი მენეჯერი',
    verified: true,
    career: [{ clubName: 'საბურთალო', startYear: 2021, endYear: null, position: POS('AM') }],
    videoLinks: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
  },
  {
    email: `player5${DEMO_DOMAIN}`,
    firstName: 'დავით',
    lastName: 'გოგია',
    city: 'რუსთავი',
    age: 29,
    positions: [POS('GK')],
    height: 192,
    weight: 86,
    foot: 'RIGHT',
    experience: 'PROFESSIONAL',
    currentClub: 'დილა გორი',
    jerseyNumber: 1,
    bio: 'საიმედო მეკარე სწრაფი რეაქციითა და ჰაერში თამაშის უნარით.',
    desiredLeague: 'Ligue 1',
    agentName: 'ნიკა აგენტი',
    verified: true,
    career: [{ clubName: 'დილა გორი', startYear: 2016, endYear: null, position: POS('GK') }],
    videoLinks: [],
  },
  {
    email: `player6${DEMO_DOMAIN}`,
    firstName: 'ირაკლი',
    lastName: 'ცქიტიშვილი',
    city: 'თბილისი',
    age: 23,
    positions: [POS('DM'), POS('CM')],
    height: 181,
    weight: 75,
    foot: 'BOTH',
    experience: 'PROFESSIONAL',
    currentClub: 'ლოკომოტივი თბილისი',
    jerseyNumber: 6,
    bio: 'ბალანსირებული ოპორნიკი, კარგად ფლობს ბურთს და ეხმარება დაცვას.',
    desiredLeague: 'ეროვნული ლიგა',
    agentName: 'ლაშა წარმომადგენელი',
    verified: true,
    career: [
      { clubName: 'ლოკომოტივი თბილისი', startYear: 2019, endYear: null, position: POS('DM') },
    ],
    videoLinks: [],
  },
  {
    email: `player7${DEMO_DOMAIN}`,
    firstName: 'ბექა',
    lastName: 'ლომიძე',
    city: 'ზუგდიდი',
    age: 25,
    positions: [POS('RB'), POS('RW')],
    height: 179,
    weight: 73,
    foot: 'RIGHT',
    experience: 'SEMI_PROFESSIONAL',
    currentClub: 'სამგურალი წყალტუბო',
    jerseyNumber: 2,
    bio: 'შრომისმოყვარე მარჯვენა მცველი, აქტიური შეტევაში ჩართვით.',
    desiredLeague: 'კრისტალი ლიგა',
    agentName: 'თემურ მენეჯერი',
    verified: true,
    career: [
      { clubName: 'სამგურალი წყალტუბო', startYear: 2020, endYear: null, position: POS('RB') },
    ],
    videoLinks: [],
  },
  {
    email: `player8${DEMO_DOMAIN}`,
    firstName: 'ალექსანდრე',
    lastName: 'ქავთარაძე',
    city: 'თბილისი',
    age: 22,
    positions: [POS('LB')],
    height: 177,
    weight: 72,
    foot: 'LEFT',
    experience: 'SEMI_PROFESSIONAL',
    currentClub: 'სიონი ბოლნისი',
    jerseyNumber: 3,
    bio: 'მარცხენა მცველი კარგი ფიზიკითა და შეტევის მხარდაჭერის უნარით.',
    desiredLeague: 'ეროვნული ლიგა',
    agentName: 'ბექა აგენტი',
    verified: true,
    career: [{ clubName: 'სიონი ბოლნისი', startYear: 2021, endYear: null, position: POS('LB') }],
    videoLinks: [],
  },
  // Two pending footballers — appear in the admin verification queue, not the public directory.
  {
    email: `player9${DEMO_DOMAIN}`,
    firstName: 'გიორგი',
    lastName: 'ნადირაძე',
    city: 'თბილისი',
    age: 18,
    positions: [POS('CF')],
    height: 183,
    weight: 74,
    foot: 'RIGHT',
    experience: 'AMATEUR',
    currentClub: '',
    jerseyNumber: 19,
    bio: 'ახალგაზრდა, პერსპექტიული თავდამსხმელი, ვეძებ პირველ პროფესიონალურ კონტრაქტს.',
    desiredLeague: 'კრისტალი ლიგა',
    agentName: '',
    verified: false,
    career: [],
    videoLinks: [],
  },
  {
    email: `player10${DEMO_DOMAIN}`,
    firstName: 'ნოდარ',
    lastName: 'შენგელია',
    city: 'ფოთი',
    age: 20,
    positions: [POS('CM'), POS('AM')],
    height: 180,
    weight: 73,
    foot: 'RIGHT',
    experience: 'AMATEUR',
    currentClub: '',
    jerseyNumber: 15,
    bio: 'უნივერსალური ნახევარმცველი, მზად ვარ ახალი გამოწვევისთვის.',
    desiredLeague: 'კრისტალი ლიგა',
    agentName: '',
    verified: false,
    career: [],
    videoLinks: [],
  },
];

// ── Seed function ─────────────────────────────────────────────────────────────

export async function seedDemo() {
  const prisma = new PrismaClient();

  try {
    // Scoped wipe — only demo accounts. Cascades remove their profiles, posts,
    // roster, conversations, etc. Real accounts and reference data are untouched.
    const deleted = await prisma.user.deleteMany({
      where: { email: { endsWith: DEMO_DOMAIN } },
    });
    if (deleted.count > 0) {
      console.log(`• removed ${deleted.count} existing demo account(s)`);
    }

    const now = new Date();
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    // Admin
    await prisma.user.create({
      data: {
        email: `admin${DEMO_DOMAIN}`,
        role: 'ADMIN',
        emailVerified: now,
        passwordHash,
        firstName: 'დემო',
        lastName: 'ადმინი',
      },
    });

    // Clubs
    const clubProfileIdByEmail = new Map<string, string>();
    const clubUserIdByEmail = new Map<string, string>();
    for (const c of CLUBS) {
      const user = await prisma.user.create({
        data: {
          email: c.email,
          role: 'CLUB',
          emailVerified: now,
          passwordHash,
          firstName: c.name,
          lastName: '',
          clubProfile: {
            create: {
              name: c.name,
              foundedYear: c.foundedYear,
              country: 'GE',
              city: c.city,
              league: c.league,
              officialWebsite: c.website,
              stadiumName: c.stadiumName,
              stadiumCapacity: c.stadiumCapacity,
              bio: c.bio,
              verificationStatus: c.verified ? 'VERIFIED' : 'PENDING',
              isVisible: true,
              historyEvents: {
                create: c.history.map((h, i) => ({
                  year: h.year,
                  title: h.title,
                  description: h.description,
                  orderIndex: i,
                })),
              },
              rosterEntries: {
                create: c.roster.map((r, i) => ({
                  playerName: r.playerName,
                  position: r.position,
                  jerseyNumber: r.jerseyNumber,
                  orderIndex: i,
                })),
              },
              posts: {
                create: c.posts.map((p, i) => ({
                  title: p.title,
                  body: p.body,
                  // Stagger createdAt so the newsfeed has a believable timeline.
                  createdAt: new Date(now.getTime() - (i + 1) * 36 * 60 * 60 * 1000),
                })),
              },
            },
          },
        },
        include: { clubProfile: true },
      });
      clubUserIdByEmail.set(c.email, user.id);
      if (user.clubProfile) clubProfileIdByEmail.set(c.email, user.clubProfile.id);
    }

    // Footballers
    const footballerProfileIdByEmail = new Map<string, string>();
    const footballerUserIdByEmail = new Map<string, string>();
    for (const f of FOOTBALLERS) {
      const dob = new Date(now.getFullYear() - f.age, 4, 15);
      const user = await prisma.user.create({
        data: {
          email: f.email,
          role: 'FOOTBALLER',
          emailVerified: now,
          passwordHash,
          firstName: f.firstName,
          lastName: f.lastName,
          footballerProfile: {
            create: {
              firstName: f.firstName,
              lastName: f.lastName,
              dateOfBirth: dob,
              nationality: 'GE',
              country: 'GE',
              city: f.city,
              phone: '+995 555 00 00 00',
              bio: f.bio,
              positions: f.positions,
              height: f.height,
              weight: f.weight,
              dominantFoot: f.foot,
              currentClub: f.currentClub || null,
              jerseyNumber: f.jerseyNumber,
              experienceLevel: f.experience,
              desiredLeague: f.desiredLeague,
              agentName: f.agentName || null,
              agentPhone: f.agentName ? '+995 599 11 22 33' : null,
              agentEmail: f.agentName ? 'agent@demo.ge' : null,
              videoLinks: f.videoLinks,
              verificationStatus: f.verified ? 'VERIFIED' : 'PENDING',
              isVisible: true,
              profileViewCount: Math.floor(Math.random() * 200),
              careerEntries: {
                create: f.career.map((e, i) => ({
                  clubName: e.clubName,
                  startYear: e.startYear,
                  endYear: e.endYear,
                  position: e.position,
                  orderIndex: i,
                })),
              },
            },
          },
        },
        include: { footballerProfile: true },
      });
      footballerUserIdByEmail.set(f.email, user.id);
      if (user.footballerProfile)
        footballerProfileIdByEmail.set(f.email, user.footballerProfile.id);
    }

    const verifiedClubEmails = CLUBS.filter((c) => c.verified).map((c) => c.email);
    const verifiedFootballerEmails = FOOTBALLERS.filter((f) => f.verified).map((f) => f.email);

    // Subscriptions — each verified footballer follows 3 clubs → populated newsfeed.
    let subCount = 0;
    for (let fi = 0; fi < verifiedFootballerEmails.length; fi++) {
      const fpId = footballerProfileIdByEmail.get(verifiedFootballerEmails[fi]!)!;
      for (let k = 0; k < 3; k++) {
        const clubEmail = verifiedClubEmails[(fi + k) % verifiedClubEmails.length]!;
        const cpId = clubProfileIdByEmail.get(clubEmail)!;
        await prisma.clubSubscription.create({
          data: { footballerProfileId: fpId, clubProfileId: cpId },
        });
        subCount++;
      }
    }

    // Shortlists — each verified club saves 3 footballers → populated shortlist page.
    let shortlistCount = 0;
    for (let ci = 0; ci < verifiedClubEmails.length; ci++) {
      const cpId = clubProfileIdByEmail.get(verifiedClubEmails[ci]!)!;
      for (let k = 0; k < 3; k++) {
        const fEmail = verifiedFootballerEmails[(ci + k) % verifiedFootballerEmails.length]!;
        const fpId = footballerProfileIdByEmail.get(fEmail)!;
        await prisma.clubShortlist.create({
          data: { clubProfileId: cpId, footballerProfileId: fpId },
        });
        shortlistCount++;
      }
    }

    // Post likes — verified footballers like some posts.
    const allPosts = await prisma.clubPost.findMany({ select: { id: true } });
    let likeCount = 0;
    for (let fi = 0; fi < verifiedFootballerEmails.length; fi++) {
      const fpId = footballerProfileIdByEmail.get(verifiedFootballerEmails[fi]!)!;
      // each footballer likes a rotating subset of posts
      for (let pi = fi; pi < allPosts.length; pi += 3) {
        await prisma.postLike.create({
          data: { postId: allPosts[pi]!.id, footballerProfileId: fpId },
        });
        likeCount++;
      }
    }

    // Conversations + messages — a few club↔footballer threads.
    const threads: {
      clubEmail: string;
      footballerEmail: string;
      messages: { from: 'club' | 'footballer'; body: string; read: boolean }[];
    }[] = [
      {
        clubEmail: `club1${DEMO_DOMAIN}`,
        footballerEmail: `player1${DEMO_DOMAIN}`,
        messages: [
          {
            from: 'club',
            body: 'გამარჯობა, დაგვაინტერესა თქვენი პროფილი. გვაქვს შეთავაზება.',
            read: true,
          },
          {
            from: 'footballer',
            body: 'გამარჯობა, მადლობა! სიამოვნებით მოვისმენ დეტალებს.',
            read: true,
          },
          { from: 'club', body: 'შესანიშნავია. მოდით ამ კვირაში მოვაწყოთ შეხვედრა.', read: false },
        ],
      },
      {
        clubEmail: `club2${DEMO_DOMAIN}`,
        footballerEmail: `player2${DEMO_DOMAIN}`,
        messages: [
          {
            from: 'club',
            body: 'გამარჯობა, თქვენი თამაში მოგვწონს. დაინტერესებული ხართ ტრანსფერით?',
            read: true,
          },
          { from: 'footballer', body: 'დიახ, ღია ვარ ახალი გამოწვევისთვის.', read: false },
        ],
      },
      {
        clubEmail: `club3${DEMO_DOMAIN}`,
        footballerEmail: `player3${DEMO_DOMAIN}`,
        messages: [{ from: 'club', body: 'გამარჯობა, გვინდა გესაუბროთ კონტრაქტზე.', read: false }],
      },
    ];
    let msgCount = 0;
    for (const t of threads) {
      const clubUserId = clubUserIdByEmail.get(t.clubEmail)!;
      const footballerUserId = footballerUserIdByEmail.get(t.footballerEmail)!;
      const conv = await prisma.conversation.create({
        data: { clubUserId, footballerUserId },
      });
      for (let mi = 0; mi < t.messages.length; mi++) {
        const m = t.messages[mi]!;
        await prisma.message.create({
          data: {
            conversationId: conv.id,
            senderUserId: m.from === 'club' ? clubUserId : footballerUserId,
            body: m.body,
            read: m.read,
            createdAt: new Date(now.getTime() - (t.messages.length - mi) * 30 * 60 * 1000),
          },
        });
        msgCount++;
      }
    }

    // Service requests — a couple of footballers request services.
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { orderIndex: 'asc' },
      select: { id: true },
    });
    let srCount = 0;
    if (categories.length > 0) {
      const year = now.getFullYear();
      const requesters = [
        verifiedFootballerEmails[0]!,
        verifiedFootballerEmails[1]!,
        verifiedFootballerEmails[2]!,
      ];
      for (let i = 0; i < requesters.length; i++) {
        const userId = footballerUserIdByEmail.get(requesters[i]!)!;
        await prisma.serviceRequest.create({
          data: {
            requestCode: `SR-${year}-${String(i + 1).padStart(4, '0')}`,
            userId,
            categoryId: categories[i % categories.length]!.id,
            startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            notes: 'დემო მოთხოვნა — გთხოვთ დამიკავშირდეთ დეტალებისთვის.',
            contactPref: 'EMAIL',
            status: 'PENDING',
          },
        });
        srCount++;
      }
    }

    // Notifications — a handful per role so the bell icon isn't empty.
    let notifCount = 0;
    for (const fEmail of verifiedFootballerEmails.slice(0, 4)) {
      const userId = footballerUserIdByEmail.get(fEmail)!;
      await prisma.notification.createMany({
        data: [
          {
            userId,
            type: 'ACCOUNT_APPROVED',
            title: 'პროფილი დადასტურდა',
            body: 'თქვენი პროფილი წარმატებით გადამოწმდა და ახლა ხილვადია დირექტორიაში.',
            read: true,
          },
          {
            userId,
            type: 'NEW_CLUB_POST',
            title: 'ახალი პოსტი კლუბისგან',
            body: 'თქვენ მიერ გამოწერილმა კლუბმა ახალი სიახლე გამოაქვეყნა.',
            read: false,
          },
        ],
      });
      notifCount += 2;
    }
    for (const cEmail of verifiedClubEmails.slice(0, 3)) {
      const userId = clubUserIdByEmail.get(cEmail)!;
      await prisma.notification.create({
        data: {
          userId,
          type: 'ACCOUNT_APPROVED',
          title: 'კლუბის პროფილი დადასტურდა',
          body: 'თქვენი კლუბის პროფილი გადამოწმდა და ხილვადია.',
          read: false,
        },
      });
      notifCount++;
    }

    console.log('✓ Demo database seeded');
    console.log(
      `  ${CLUBS.length} clubs, ${FOOTBALLERS.length} footballers, 1 admin\n` +
        `  ${subCount} subscriptions, ${shortlistCount} shortlists, ${likeCount} post likes\n` +
        `  ${threads.length} conversations / ${msgCount} messages, ${srCount} service requests, ${notifCount} notifications`,
    );
    console.log(`\n  Login for every demo account → password: ${DEMO_PASSWORD}`);
    console.log(`  Admin:      admin${DEMO_DOMAIN}`);
    console.log(`  Clubs:      club1${DEMO_DOMAIN} … club10${DEMO_DOMAIN}`);
    console.log(`  Footballers: player1${DEMO_DOMAIN} … player10${DEMO_DOMAIN}`);
  } finally {
    await prisma.$disconnect();
  }
}

// ── CLI entrypoint ────────────────────────────────────────────────────────────

const isCLI = process.argv[1] != null && fileURLToPath(import.meta.url) === process.argv[1];

if (isCLI) {
  seedDemo()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
