import type { Directive } from 'vue' 

// Define an image lazy loading directive: the element being operated on is an image, and the directive value is the image address string.
const lazyLoad: Directive<HTMLImageElement, string> = {

  mounted(el, binding) {
    //Create an IntersectionObserver to watch whether the image element is visible on the screen.
    const observer = new IntersectionObserver((entries) => {
     // Get the observation results corresponding to the current image.
      const entry = entries[0]

      //When the image enters the viewport
      if (entry?.isIntersecting) {
        // Assign the real image URL
        el.src = binding.value
        // Stop observing after loading once
        observer.unobserve(el)
      } 
    }) 

    // Start observing the image element
    observer.observe(el)
  }, 
} 

export default lazyLoad 