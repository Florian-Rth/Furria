import { useState } from 'react';
import { supportsScrollDriven } from './scroll-linked';

export const useScrollDriven = (): boolean => useState(supportsScrollDriven)[0];
