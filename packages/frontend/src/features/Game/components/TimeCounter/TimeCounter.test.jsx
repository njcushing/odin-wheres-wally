/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { forwardRef } from 'react'
import TimeCounter from './index.jsx'

const renderComponent = () => {
    render(
        <TimeCounter
            startTime={0}
            counting={true}
        />
    );
}

describe("UI/DOM Testing...", () => {
    describe("The heading element displaying the elapsed time...", () => {
        test("Should be present in the document", async () => {
            await act(() => renderComponent());
            const elapsedTime = screen.getByRole("heading", { name: "elapsed-time" });
            expect(elapsedTime).toBeInTheDocument();
        });
    });
});