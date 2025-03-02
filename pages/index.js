import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import * as React from 'react';
import Button from '@mui/material/Button';
import PermanentDrawerLeft from '../components/navbar';


export default function Home() {
  const [chatQuery, setChatQuery] = useState("");
  const [result, setResult] = useState();
  const [messages,setMessages] = useState([]);

  async function onSubmit(event) {
    event.preventDefault();
    try {
      //push the user message onto the convo
      messages.push({role: "user", content:chatQuery})
      setMessages(JSON.parse(JSON.stringify(messages)));
      scrollToBottomWithSmoothScroll();

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
        {
            chatQuery: chatQuery,
            conversation:messages 
        }),
      });

      setChatQuery("");
      scrollToBottomWithSmoothScroll();

      const stream = response.body;
      const reader = stream.getReader();

      let result = '';
      const decoder = new TextDecoder();
      let firstResult=true;
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const raw_message= new TextDecoder().decode(value);
        const new_messages_json = JSON.parse('[' + raw_message.replace(/\}\{/g, '},{') + ']');
        //console.log(new_messages_json);
        for (let i = 0; i < new_messages_json.length; i++) {
            if(firstResult){
                messages.push(new_messages_json[i]);
                const newMessages = JSON.parse(JSON.stringify(messages))
                setMessages(newMessages);
                firstResult=false;
            }else{
                messages[messages.length-1].content+=new_messages_json[i].content;
                const newMessages = JSON.parse(JSON.stringify(messages))
                setMessages(newMessages);
            }
        }

        scrollToBottomWithSmoothScroll();

      }

      scrollToBottomWithSmoothScroll();
      
     //response.data.on('data', data => {
     //    console.log("cool");
     //    console.log(data);
     //});

 //   const data = await response.json();

 //   if (response.status !== 200) {
 //     throw data.error || new Error(`Request failed with status ${response.status}`);
 //   }
 //   messages.push(data.result);
 //   setAnimalInput("");
    } catch(error) {
      // Consider implementing your own error handling logic here
      alert(error.message);
    }
  }

// without smooth-scroll
const scrollToBottom = () => {
        const theElement = document.getElementById('convo_ul');
        theElement.scrollTop = theElement.scrollHeight;
		//divRef.current.scrollTop = divRef.current.scrollHeight;
};

//with smooth-scroll
const scrollToBottomWithSmoothScroll = () => {
    const theElement = document.getElementById('convo_ul');
       theElement.scrollTo({
        top: theElement.scrollHeight,
        behavior: 'smooth',
      })
}

//scrollToBottomWithSmoothScroll()


  return (
    <div>

      <Head>
        <title>ChatGPT Arms</title>
      </Head>
      <PermanentDrawerLeft></PermanentDrawerLeft>
      <main className={styles.main}>
        <ul className={styles.convo_ul} id="convo_ul">
            {messages.map((message) => (
              <li key={message.content}><div>{message.content}</div></li>
            ))}
        </ul>

        <form onSubmit={onSubmit} className={styles.search_form}>
          <input
            type="text"
            name="animal"
            placeholder="How can i help you?"
            value={chatQuery}
            onChange={(e) => setChatQuery(e.target.value)}
          />
        </form>
      </main>
    </div>
  );
}
