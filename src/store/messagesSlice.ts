import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  chartData?: {
    data: any[];
    chartType: string;
    chartExplanation?: string;
    sqlQuery?: string;
  };
}

interface MessagesState {
  messages: Message[];
  isTyping: boolean;
}

const initialState: MessagesState = {
  messages: [
    {
      id: '1',
      text: 'Hello! I\'m your AskDB assistant. How can I help you with your database queries today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ],
  isTyping: false,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [
        {
          id: '1',
          text: 'Hello! I\'m your AskDB assistant. How can I help you with your database queries today?',
          sender: 'bot',
          timestamp: new Date(),
        },
      ];
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
  },
});

export const { addMessage, clearMessages, setTyping } = messagesSlice.actions;
export default messagesSlice.reducer;