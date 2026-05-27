export type FootballerProfileForCompletion = {
  dateOfBirth: Date | null;
  nationality: string | null;
  city: string | null;
  phone: string | null;
  bio: string | null;
  positions: string[];
  height: number | null;
  weight: number | null;
  dominantFoot: string | null;
  currentClub: string | null;
  experienceLevel: string | null;
  avatarKey: string | null;
};

export type FootballerProfileCompletion = {
  percent: number;
  missingFields: string[];
};

export function computeFootballerProfileCompletion(
  profile: FootballerProfileForCompletion,
): FootballerProfileCompletion {
  const checks: [boolean, string][] = [
    [!!profile.dateOfBirth, 'დაბადების თარიღი'],
    [!!profile.nationality, 'ეროვნება'],
    [!!profile.city, 'ქალაქი'],
    [!!profile.phone, 'ტელეფონი'],
    [!!profile.bio, 'ბიო'],
    [profile.positions.length > 0, 'პოზიცია'],
    [!!profile.height, 'სიმაღლე'],
    [!!profile.weight, 'წონა'],
    [!!profile.dominantFoot, 'სასურველი ფეხი'],
    [!!profile.currentClub, 'მიმდინარე კლუბი'],
    [!!profile.experienceLevel, 'გამოცდილება'],
    [!!profile.avatarKey, 'ავატარი'],
  ];

  const filled = checks.filter(([ok]) => ok).length;
  const missingFields = checks.filter(([ok]) => !ok).map(([, label]) => label);
  return {
    percent: Math.round((filled / checks.length) * 100),
    missingFields,
  };
}
