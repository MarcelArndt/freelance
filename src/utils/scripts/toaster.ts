    import { gsap } from "../../lib/gsap";
    type ToasterType = "info" | "error" | "success" | ""

    const icon: Record<ToasterType, HTMLElement | null> = {
        "success": document.querySelector<HTMLElement>('[toaster-success-icon]'),        
        "error": document.querySelector<HTMLElement>('[toaster-error-icon]'),
        "info": document.querySelector<HTMLElement>('[toaster-info-icon]'),
        "": null,
    }

    const textWrapper = document.querySelector<HTMLElement>('[toaster-text-wrapper]');
    const contentWrapper = document.querySelector<HTMLElement>('[toaster-content-wrapper]');
    const mainWrapper = document.querySelector<HTMLElement>('[toaster-wrapper]');
    const closeButton = document.querySelector<HTMLElement>('[toaster-close-button]');
    let currentTimeOut: ReturnType<typeof setTimeout> = 0;
    let currentType = "";
    let latestMessage = ""

    export function setToaster(type:ToasterType, message:string){
        const sameMessage = checkTimeOut(type, message);
        if(sameMessage) return;
        if(!textWrapper) return;
        textWrapper.textContent = '';
        const newTextMessage = generateMessageElements(message, false);
        const newSubline = generateMessageElements(type, true);
        textWrapper.appendChild(newSubline);
        textWrapper.appendChild(newTextMessage);
        disableAllIcons();
        const currentIcon = icon[type]
        if(currentIcon){
            currentIcon?.classList.add("active")
        }
        fadeInAnimtion();
    }

    function generateMessageElements(message:string, toTitle:boolean=false){
        let newTextMessage = document.createElement('p');
        newTextMessage.textContent = message;
        if(toTitle) newTextMessage.style.textTransform = "capitalize";
        newTextMessage.style.fontSize="1.125rem";
        newTextMessage.style.lineHeight="1.5rem";
        return newTextMessage
    }
 
    function checkTimeOut(tpye:ToasterType, message:string){
        if(currentType == tpye && latestMessage == message) return true;
        currentType = tpye;
        latestMessage = message;
        if(currentTimeOut) clearTimeout(currentTimeOut)
        currentTimeOut = setTimeout(() => {
            closeToaster();
            latestMessage = "";
            currentType = "";
        }, 5000);
        return false;
    }

    async function closeToaster(){
        fadeOutAnimtion();
        if(currentTimeOut){
            clearTimeout(currentTimeOut);
        }
        currentTimeOut = 0;
    }

    function disableAllIcons(){
        const ArrayOfKeys = Object.keys(icon) as ToasterType[];  
        ArrayOfKeys.forEach((key:ToasterType)=> {
            icon[key]?.classList.remove("active");
        });
    }

    function fadeInAnimtion(){
        gsap.killTweensOf(textWrapper);
        gsap.killTweensOf(contentWrapper);
        gsap.killTweensOf(mainWrapper);
        gsap.set(contentWrapper,{
            y:0,
        })
        const tl = gsap.timeline();
        tl.to(mainWrapper,{
            opacity:1,
            duration:0.5,
            onStart: () => {
                gsap.set(mainWrapper, { pointerEvents: "auto", display: "flex" }); 
            },
        }).from(contentWrapper,{
            y:500,
            duration:0.5,
        })
    }

    async function fadeOutAnimtion(){
        gsap.killTweensOf(textWrapper);
        gsap.killTweensOf(contentWrapper);
        gsap.killTweensOf(mainWrapper);
        
        const tl = gsap.timeline();
        tl.to(contentWrapper,{
            y:500,
            duration:0.5,
            onStart: () => {
            gsap.set(mainWrapper, { pointerEvents: "none" }); 
        },
        }).to(mainWrapper,{
            opacity:0,
            duration:0.5,
            onComplete: () => {
                gsap.set(mainWrapper, {display:"none"});
            }
        });

      return new Promise(resolve => tl.eventCallback("onComplete", resolve));
    }

    function init(){
        if(!closeButton) return;
        closeButton.addEventListener("click", () => {
             closeToaster()
        });
    }
    
    init()