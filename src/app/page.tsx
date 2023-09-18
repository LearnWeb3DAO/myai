"use client";
import { useEffect,  useState } from "react";
import {
  ChatMessage,
  EventType,
  MessageOutput,
  WindowAI,
  getWindowAI,
} from "window.ai";

export default function Home() {
  const [ai, setAi] = useState<WindowAI | null> (null)
  const [theModel, setTheModel] = useState<undefined | string>();
  const [allMessages, setAllMessages] = useState<ChatMessage[] | []>([])
  // const [allMessages, setallMessages] = useState<ChatMessage[] | []>([])
  const [theInput, setTheInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const getResponses = async () => {
    setIsLoading(true);
    const userMessage: ChatMessage = {role:"user", content:theInput}
    setTheInput("")
    setAllMessages((prev)=>[...prev, userMessage])
    // setallMessages((prev)=>[...prev, userMessage])
    let tempArray: ChatMessage[] = [...allMessages, userMessage] 
    const streamingOptions = {
      temperature: 0.7,
      maxTokens: 1000,
      onStreamResult: (result: MessageOutput | null, error: string | null) => {
        if (error) {
          console.error("window.ai streaming completion failed.");
          return;
        } else if (result) {
          setIsLoading(false )
          const lastMessage = tempArray[tempArray.length - 1];
          if (lastMessage.role === "user") {
            setAllMessages ((prev)=>[
              ...prev,
              {
                role: "assistant",
                content: result.message.content,
              },
            ]);
            tempArray.push({
              role: "assistant", content: result.message.content})
          } else {
            const updatedMessages = tempArray.map((message, index) => {
              if (index === tempArray.length - 1) {
                return {
                  ...message,
                  content: message.content + result.message.content,
                };
              }
              return message;
            });
            tempArray=updatedMessages
            // setallMessages(updatedMessages)
            setAllMessages(updatedMessages)
          }
          // setAllMessages(prev=>[...prev, tempObj ]);
        }
      },
       
    };
    
    if (ai){
     try {
      await ai.generateText(
        {
          messages: tempArray,
        },
        streamingOptions
      );
    } catch (e) {
      console.error("window.ai generation completion failed.");
      console.error(e);
    }
  };


}

useEffect(()=>{
}, [allMessages])

  useEffect(() => {
    const init = async () => {
      const getter = await getWindowAI();
       setAi(getter)
      if (getter) {
        setTheModel(await getter.getCurrentModel());
        getter.addEventListener((event: EventType, data: any) => {
          if (event === "model_changed") {
            setTheModel(data.model);
            
          }
        });
      } else {
      }
    };
    init();
  }, []);




  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-24 py-5 bg-gray-900">
      <h1 className="text-5xl font-sans">MyAI</h1>

      <>
        {theModel?      
        (
          <div className="flex   h-[35rem] w-[40rem] flex-col items-center justify-center bg-gray-600 rounded-xl">
            <div className=" h-full flex flex-col gap-2 overflow-y-auto py-8 px-3 w-full">
              <div className="-mt-2 text-center">
                <span >{"Currently using: "+ theModel }</span>

              
              </div>
              {allMessages
                ? allMessages.map((e) => {
                    return (
                      <div
                        key={e.content}
                        className={`w-max max-w-[18rem] rounded-md px-4 py-3 h-min ${
                          e.role === "assistant"
                            ? "self-start  bg-gray-200 text-gray-800"
                            : "self-end  bg-gray-800 text-gray-50"
                        } `}
                      >
                        {e.content}
                      </div>
                    );
                  })
                : ""}

              {isLoading ? <div className="self-start  bg-gray-200 text-gray-800 w-max max-w-[18rem] rounded-md px-4 py-3 h-min">*thinking*</div> : ""}
            </div>


            <div className="relative  w-[80%] border-red-500 bottom-4 flex justify-center">
            <div className="flex w-full"> <textarea
                value={theInput}
                onChange={(event) => setTheInput(event.target.value)}
                className="w-[85%] h-10 px-3 py-2 resize-none overflow-y-auto text-black bg-gray-300 rounded-l-lg outline-none"
                // onKeyDown={Submit}
              />
              <button
                onClick={getResponses}
                className="w-[15%] bg-blue-500 px-4 py-2  rounded-r-lg "
              >
                send
              </button>
              </div>
            </div>
          </div>
        ) :(
          <div className="flex   h-[35rem] w-[40rem] flex-col items-center justify-center bg-gray-600 rounded-xl">
            <div className="flex self-center  my-24 flex-col">
              <div>Select a model from your Window extension</div>
            </div>
          </div>
        ) 
}
      </>

      <div></div>
    </main>
  );
}
