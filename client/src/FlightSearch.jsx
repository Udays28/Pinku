import React, { useState } from 'react';
import './flight.css';

const FlightSearch = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [step, setStep] = useState(1); // Track the conversation step
  const [error, setError] = useState(null);

  // Store user's responses to each question
  const [conversationData, setConversationData] = useState({
    name: '',
    origin: '',
    destination: '',
    departureDate: ''
  });

  // Handle the user's input and proceed to the next step
  const handleUserInput = async (input) => {
    setUserInput(''); // Clear input field after sending
    setChatMessages((prevMessages) => [...prevMessages, { type: 'user', text: input }]);
    setLoading(true); // Indicate bot is processing
    let updatedConversationData = { ...conversationData };

    try {
      switch (step) {
        case 1: // Ask for the user's name
          updatedConversationData.name = input;
          setConversationData(updatedConversationData);
          setChatMessages((prevMessages) => [...prevMessages, { type: 'bot', text: `Hi ${input}! What is your origin airport? (Enter IATA code, e.g., IDR for Indore)` }]);
          setStep(2);
          break;

        case 2: // Ask for origin (IATA code)
          if (!/^[A-Z]{3}$/.test(input)) {
            setChatMessages((prevMessages) => [...prevMessages, { type: 'bot', text: 'Please enter a valid 3-letter IATA code for your origin.' }]);
            setLoading(false);
            return;
          }
          updatedConversationData.origin = input;
          setConversationData(updatedConversationData);
          setChatMessages((prevMessages) => [...prevMessages, { type: 'bot', text: 'Where are you flying to? (Enter IATA code, e.g., BOM for Mumbai)' }]);
          setStep(3);
          break;

        case 3: // Ask for destination (IATA code)
          if (!/^[A-Z]{3}$/.test(input)) {
            setChatMessages((prevMessages) => [...prevMessages, { type: 'bot', text: 'Please enter a valid 3-letter IATA code for your destination.' }]);
            setLoading(false);
            return;
          }
          updatedConversationData.destination = input;
          setConversationData(updatedConversationData);
          setChatMessages((prevMessages) => [...prevMessages, { type: 'bot', text: 'When would you like to depart? (Please provide a date in YYYY-MM-DD format)' }]);
          setStep(4);
          break;

        case 4: // Ask for departure date
          if (!/\d{4}-\d{2}-\d{2}/.test(input)) {
            setChatMessages((prevMessages) => [...prevMessages, { type: 'bot', text: 'Please enter a valid departure date in YYYY-MM-DD format.' }]);
            setLoading(false);
            return;
          }
          updatedConversationData.departureDate = input;
          setConversationData(updatedConversationData);

          // Fetch flight data after all inputs are collected
          const { origin, destination, departureDate } = updatedConversationData;
          const response = await fetch(`http://localhost:3000/api/flights?origin=${origin}&destination=${destination}&departureDate=${departureDate}`);
          if (!response.ok) throw new Error('Failed to fetch flight data');

          const data = await response.json();
          setFlights(data);
          setChatMessages((prevMessages) => [...prevMessages, { type: 'bot', text: `Thank you, ${conversationData.name}. Here are your flight options!` }]);
          setStep(5); // Move to the next step (final step)
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flight-search">
      <h2>Flight Search Chatbot</h2>

      <div className="chat-box">
        {chatMessages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <p><strong>{message.type === 'user' ? 'You' : 'Bot'}:</strong> {message.text}</p>
          </div>
        ))}
      </div>

      <div className="input-area">
        {step <= 4 && (
          <>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={loading}
              placeholder="Type your answer..."
            />
            <button onClick={() => handleUserInput(userInput)} disabled={loading}>
              {loading ? 'Processing...' : 'Send'}
            </button>
          </>
        )}

        {error && <p className="error">Error: {error}</p>}

        {/* Display flight results if available */}
        {flights.length > 0 && (
          <div className="flight-results">
            <h3>Flight Results:</h3>
            <ul>
              {flights.map((flight, index) => (
                <li key={index}>
                  {flight.price.total} {flight.price.currency} - 
                  {flight.itineraries[0].segments[0].departure.iataCode} to 
                  {flight.itineraries[0].segments[0].arrival.iataCode}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;
