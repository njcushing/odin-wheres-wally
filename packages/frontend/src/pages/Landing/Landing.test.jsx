/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { forwardRef } from 'react'
import Landing from './index.jsx'

describe("placeholder", () => {
    test("placeholder", () => {
        expect("").toBe("");
    })
});
