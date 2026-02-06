import { createTranslator } from '../utils/i18n.js';

export const localeMiddleware = (req, res, next) => {
  const acceptLanguage = req.headers['accept-language'];
  const { locale, t } = createTranslator(acceptLanguage);

  req.locale = locale;
  req.t = t;
  res.locals.locale = locale;
  res.locals.t = t;

  next();
};
