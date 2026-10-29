import { forms, type Verb } from '../data/verbs';
import { pick } from './random';

/** Errors típics que fan servir el mode Caça l'error i les trampes del Crazy. */
const CONFUSIONS: Record<string, string[]> = {
  bought: ['brought', 'buyed'],
  brought: ['bought', 'bringed', 'brang'],
  taught: ['thought', 'teached'],
  thought: ['taught', 'thinked'],
  caught: ['catched', 'caughten'],
  laid: ['layed', 'lain'],
  lay: ['laid', 'lied'],
  lain: ['laid', 'lied'],
  rose: ['rised', 'raised'],
  risen: ['rised', 'rosen'],
  went: ['goed', 'wented'],
  gone: ['went', 'goed'],
  swum: ['swam', 'swimmed'],
  swam: ['swum', 'swimmed'],
  sang: ['sung', 'singed'],
  sung: ['sang', 'singed'],
  drank: ['drunk', 'drinked'],
  drunk: ['drank', 'drinked'],
  began: ['begun', 'beginned'],
  begun: ['began', 'beginned'],
  ran: ['runned', 'run'],
  came: ['comed', 'come'],
  ate: ['eated', 'eat'],
  eaten: ['ate', 'eated'],
  written: ['writen', 'wrote'],
  ridden: ['riden', 'rided'],
  hidden: ['hiden', 'hid'],
  bitten: ['biten', 'bit'],
  forgotten: ['forgoten', 'forgot'],
  been: ['be', 'was'],
  was: ['been', 'is'],
  did: ['done', 'doed'],
  done: ['did', 'doed'],
  saw: ['seen', 'seed'],
  seen: ['saw', 'seed'],
  told: ['telled', 'tolden'],
  sold: ['selled', 'solden'],
  fell: ['falled', 'fallen'],
  fallen: ['fell', 'fallden'],
  knew: ['knowed', 'known'],
  known: ['knew', 'knowed'],
  stood: ['standed', 'stand'],
  understood: ['understanded', 'understand'],
};

function regularize(base: string): string {
  if (base.endsWith('e')) return `${base}d`;
  if (/[^aeiou]y$/.test(base)) return `${base.slice(0, -1)}ied`;
  return `${base}ed`;
}

/** Una forma falsa però creïble per a la casella indicada (mai una de vàlida). */
export function fakeForm(verb: Verb, key: 'past' | 'pp'): string {
  const valid = forms(verb, key);
  const other = forms(verb, key === 'past' ? 'pp' : 'past');
  const candidates = [
    ...valid.flatMap((f) => CONFUSIONS[f] ?? []),
    regularize(verb.base),
    ...other,
    key === 'pp' ? `${valid[0]}en` : `${verb.base}ed`,
  ].filter((c) => !valid.includes(c));
  return candidates.length ? pick(candidates.slice(0, 4)) : regularize(verb.base) + 'ed';
}
