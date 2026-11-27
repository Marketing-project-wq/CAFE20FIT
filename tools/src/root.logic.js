
const U = n => (window.__resources && window.__resources['img_' + n]) || ('src/' + n + '.jpg');
const NO_PHOTO = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f4f1"/><stop offset="1" stop-color="#ebe8e3"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="200" cy="218" r="46" fill="none" stroke="#e30a2e" stroke-width="10"/><circle cx="200" cy="218" r="18" fill="#e30a2e"/><text x="200" y="318" text-anchor="middle" font-family="Barlow Condensed,Arial Narrow,Arial,sans-serif" font-weight="800" font-size="34" letter-spacing="3" fill="#0d0d0d">20FIT CAFE</text><text x="200" y="350" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="15" letter-spacing="3" fill="#9a978f">PHOTO SOON</text></svg>');
// Official 20FIT logo (public/brand/logo-20fit-black-trim.png of the POS, resized to 180 px) for the cup label.
const ART_LOGO = 'iVBORw0KGgoAAAANSUhEUgAAALQAAAA1CAYAAADoIcFPAAAmKElEQVR42u19eZQdV3nn7/tuVb336i29SWqpJbVa7bY2W14i7BEYowE7ISxZCCMnEzJDJgnhjGPHAzgJkwwIO5OBA4ZAYnuIh8RADocZOyGJiWEAA6NAJsa2wKustaXW0ot6fft7VXXvN39U1evXrW6pW+qWRCb3nKdWv36v6t5bv29fLuH8g6KXweIHA5DotZwjnuOMe92+4/aWwfzg2kCCTaVy5apqtdoR6CALgs2AJqJSKp2eSCadIw45hzJt60/s2/dU/nzX/Zdx5Q5aACBN+EHCG256zeqxSuWqarnaVyiU2o0xGSJJiJDPxMV0LjPRmskeTzvpQ//4w38cIiKZfZ1lGDOu/ZprXrN+vDK106tVb/J876ZqrbbRGLOCCGnP8xAEAYjCZTMzbNsGEZWZeDKRSBy1LfuZVDrzTGsy++yPXv3RwHz3WUIiXO6xGGKcb07mClzXnGul8wBdbt9xe8uZ2pmfLpaKbylVSjs8z+vRWmdqtRqMmV4nESOZTMCy7HIqlTxu2/YPM6nMk05q1TdeeGHvVPM1l5gYZdeuXdbY8NitlVrlHeVK+bZqrbrV8zzyfX/GHGffm5lhjKHm34kIruuaZDJ5KOkkv51Ipf9u7drO7+7duzdYhjX8y7gEHDoWsdi4se/tvl9/f61W3VUsFtnzPIhISAlEEv3/LOqMOV8ymQxcN/0PrpP606MDR/929vWXgitf1b35dVWvdFfNq7+9Ui1n67UaRATMbEQEIkJEBCJC9HtEgNNLb1pHQ6IQERzHgetmCgnHftJ13If7T/Z/f6m4dXd39xrLcjsSiYQAgBO97xMJPC/8CQDw5rmCM+dvdQmZlAPAGMNiy8DBgweLC5nTqlWrOlOplvaM48AYiy3LcNkv1/r7+48D8BdyjfUd67sc12lTrLQ4NokI2TLNOJukNuAAtoSfcRwHEn3OJxLyfQn3wAM8NO1H0/A8EEiISGoiBNSHaS4w79q2K3O6dvr9w6Mjv1urVtNaa4iImUOUUcTl4olSDJwIKKyUQi6bK7Xk2j6eq2c+9eLIi+WLBDUDMFu2bOkoF6vvzRcm76nWqqt83wcAw8zxxhARiTFGziEOG+I4mjdRiHRpolaOiHOsJdvyYNJNPnzkyJHRCwQ1AZDrOq9LDwXDj1ZrlduJKSAhBpOInr6cESPnFtw81ztkYg1BILZjc0tLy+8MDAw8eo75EgBZt25nqlg88GgQ+LcpVhogZUQrx3EmUrncu04fP/6D812jr+/m3Pj4kb/0Pe9WEHnGCBEJR6YUATNByRFnDP9lYibACLQYAUhIRMBAJGSl+dYRWxWIEQKJgbDrph6wZk9qR++OltO1wQfOjI/+RqlYBACjlCIRIQkHEwHMCszcENUx9xMREJGJQCVaa5mcmswEOrhf5/zVK1eu/L3R0dHSBYA6frymb8OWnePjE/+tVCq+sRZyZBMBkSMcmgjMrJQipVSDyFipeDcQrYkAIAiCmAgNEYGZOVqL+L4vQRCs0Fp/JBNk39jT0/Ph48eP/8OFqiC0mmwaQk+lWmmbpRIt6bB9G66b6VjIZzs6qol8XnorlcqKZsmbzeayOajWhVyjzRJ7DKa7VCm1EQhzSPClVzEIEAGICYlEostqBstP9/UlXq2P/eH41MRvlIpFQ+FgY4yICFmWRbZtB0pZrxDRYaWsY4ApGYOMMbJOoDcbba7xvHqiiWszACkWixCRO9tb2ycBfOhC9eXu7o27xwtnPlEulzZ4nicRUXGDsYkQEdiybFiWVVXKejWVcg9rrQ8ZY07btipYRDoQUb5v0pal1hsjW2r1ap8Ys833vWQQBDARexERjvQTqVar4nneriBo/XJX1/rfHxw8+YVZnpAFDWOyJGZQR98x8fwjKSENxtUsSiTahAWaW9F1SPt+bWFzMsSEIHpmBkDMxAKlrAXds8xKjJEqhDQIhoh47rnN4AGxVJyh/kV7YZofP9G8oBYIyBjxmmcqhwLzS5P5yfeWSyWJbhIryuS6Lhwn+b9t2/mcZeX2Dg0eHMcMvYawYUN3a6FQfq3lOP/eBP47q9WqLbESC5hyuQzFfHdPT8/3jh8//o0Fiu0GmLs61/3WxPjoH5Wr5RYxYqiJixpjwMycSqXAbB2ybfvJZDL1jRV22zMvnXhp8nwPY3v39rYxf+qmWq3y08bot3qet7ler1FDZSEQQBQEgcnnJ7tqterDnSs7cyOjIw/G6tdCQd0CYChUKIhCqqH4YUZMZLZuP+/DnBbBMn13ijmXQIu2FzInrdNERKqJQCN7iFhEeGFEMUUikmImBUA12yzxIqixlmm7ZvZap410UrPfbnyuabdjGwkwjhWDavPmzT1TU1MfqFQqDhGZSHwLM1NLS0spl8n9VzfjPrR///4SMDw9q8alRQYGBqYAfH3Hjt98anj4m0+Dxu6vlMu56NYsIqZULufcdPqeHTt2fG/fvn2VBQCBAJiNGzbeOTY5/kCpXEoSYJiIxQiEYMQYdhJJ5HLZV23L+YJtpx87ceLQMQAYwqnZ+jPN4fUwEei/CeCbvb29nw4884u1euXXCvnClprnAcyGxDAA1lqbSqXsEtHHu7rWOYODpz4dc7WFc+qzP2ZZFrK53GDCcSa0MYqmCYUavGwmpxNQY0ERXOIrCzzPK2mtDy1GfjepjdPXWhiDhjM5WUu77g/dVCotIj41qJMo1vNERIwxOlTtWPu+v7JSKa/zPG8GwJPJZJDNZo8BqIDZ4sgma6L2kIMTETOjVq8FRpuXG1MN6sG/KZcr24MgkEhUiIgglUzVs9mW3zs+cOzh6KOqiavO9nESAN637xEfwGdWruyyA9//aL1eV5EYJa21lErlN4yOTu4E8J3zgIABmO7ujbsn8pMfLZWKSQ7tHg7lFhkiYjeTLaUz2c+2ZjsePnToxWOzDcA950MSwPc1/b2/v/8EgE/c2LP1MVsl7pwql++sVEoZY4JYjDIRmUqlnGTm+9ev3zB+8uTA55sCSeccRVYzVIpItaFEIuG3tbb+l46OjifK5bLNzGKMIWNSBACp1AwXo6AMcDb8DAAkjCHFLJVIhahWq/UDBw5MLMSXnDaaIGe7cQmABbUg6nxxZKTc19f3PqVUptVu1UgDQRDwLFep+L6vS6USWlpavPxk/m1njH7U8zwnxhMRcSaT7V+9uvuXAtcaYBE7Ha3JGENu7OSwLBNf35/0td1vh5L4+g0bWtvbVzxjWZYQkY71KNu2ZeXKzkciENOcpvX8QKQ1a9a4mUz2O7ZtC8LInBCRtm1bOjs7P3We4A4BwMZ1V9+cy7WcYKXCuYFEgYQBbVmWtLS2He65atPPzbo3A6A9C58vIuCzTK+z8d3etd1vW9HSdqR5HdHma2aWltbW4Y0bN946r/th1pq2b39928oVK59m5ni/DQBJp9PV9Rs3/uTlcN3etOWmjtaWtmeitTXmlMvl6ps2bX3LAtZ2QaO3t/f1uZaWUgRkE+/pqs7OH11//fWti72eBQB5QzdXyqXroygaRV4CTiZTx1235VPAiF6km8oA4KGhoUp7++qHgyC41fd9K9KnoYMAdc+7ZcP117cOvPDC1BxcOnID9a2cnJz8VKVSXi9iDAgsAhiIsS2Lc61tz7lu7r3Hjx76YbP6sweg+wC5L7rmg9tuWi2murHOptev++1sxGIhbTnOiK3U8UwLnXLfv2n4jjse1/eFwKbouwxA+k+fePLa3s0jZFsPTeWnbg6CwEReEDbGmFKx2Gkp9ZmtPVvf8erxVwcWpnqcrRUzM9lkOU3MYylcIAtSgSIuPw9z0RfijVpgLMFKYKafOlQ9jFhaJxOLNLrFAgDP996kjXZiIIqIOI6DTCbzNwMDhw7gwnM5CLD+iYj6iWhTbGAaEfi+v0mPj18N4Nl5JkzVSv3earVySxAEBkQMCEAwSlmcbW17Ot3W+msDhw+/GkkQHX/xPsC8b+fOVG6qeKtbr72NJ8/sVEFto0PSykYsywgRCIYtPyCe0AV7sHTvD5//883bvta+euVT79i7dwrTlp4AUC/3H3zuqnVXvUsb82g+P/V6rbUhIiYi1lqbUql0YzKZ+uCuXbvu3rt3r74QX7uIELSWJlVOLj2vngvPS09A8frUtO8/0p8pDowJMzfvwYKuy7t3707Vvfp2rXWz24gdx6k7qeRTFxGbFwCyenVu1HGcgdhnHSv9OghyIrJqHsqVTZu23VKpln+9Wq3KtOFPAiJOpTMHUrmO9zSDWZqSiP64Z/sb1p2a/EJLvvDl9qmJ3+4ojdy8pja2ckNt3O7xx2mDnkC3Hsc6/4zdVR/tbCuO3thamPgPyfHRL545evhLf7r5qjdHJlbsLdMA1NFTR49kMm3vbWlpfUkpxXHwhYioXq9LqVR618DAqduavB7zejnCvwpmewI0rrRBy5qXIUrRzHsIIAJjRJjVogmaDx48uJqYN4iIifx+BoBxEonhlOMcuQguIQCwf/+rHik1ToQZIWdjDAci2Vm8IQzu7NhhF6Ymf7tcLnXEbj8iFiLATWfy6UzLB071H3i5GcwEyJ5du5Kf6bnm3pZS+bGNxfHdV5fPtK/VBclwzbiWFldpSbIRRxk4ysBhLUn2xOWycWXKdHjjqVWFqbcmxqa+/FBPz/1/dvuOltmgPnHiyP7W1vYP5nIteeaQAcTRxUqlnPW82n/cuXNnqsnr8WMxIm44J9deTiKz5iKZi9g1zufzq716fV1kuVtEpJRSDME4M49dSCRs5tQElmVXmVXzPIWIQMYkZl2fAMjkZPHmYrn45iAIhJlJRGC0hmU75KazDw+fHvhaxMkbYH5s1+5M5sTQx5zK1MdWesOdK2jcZLkuNmuyiZlFkQGTBlEggC+AFpAAxAArAjsK0qbqptsvtbUWCh+y+8cf+ssdO9bMAjX39x/+WtrNPOg4yeatJ9/3pVQq3j48PHbrhT4adaXx5+Wf05ISvVWr1YqO4zzb0dGxjkCGmEBEjlLqe/v3p4pLQv0II0az5bCZJv4mxX+3Kpe//5tB4OeiMDRH/ka2bWcfJew/mcXR8b51O1NDh//p/nbPuyfnFZDkmgkAjkNxNjEoskEkUk1NHApHs0sdBAgllSergjymJvW7JgJjf+aGvrvo+SOj0uRQzVmZB8uJ4ts9r3Z9PD8Kg0dpO5HfLSLforkSagCoUJTOk9t1WSH9Y59FyCMjI6+szazdvXHVxjf2rOq5be3atT+5fsWKN7mu+2Fgn38RCw09Dnv2cBB4HVrrZh2aTOi9L53t2Xhlc7lcenPdq0Nk+vNW0jXJXPvDowMDw7GRGhtt6xKTd2Yr+btX1c9Immqhd4IIFhFsIhgJoMWDQEeagIAJjVfoUjBQMDHkyeIAqaAgXMzfQXn9+3+2Y0dzxI33D+wfbs1m/zSZSmoRIUTBNGMM6rXaWzdsuHorpj0lc22P4ArCc/FcCFc/PkRkAZAXBl6YWq7Zfv7zf5vTWq+enYSjlFW2yBmZvSgR/zYR0xnFchlhBh1n06kXWtqzT04MNlxzTID52DU3vC4xMfWBVqMti2EUgbnBwqXhKqAF7KogjC0QCRRAaUukPfBlqhq8J1P1niHgy01cmnIdbX+dr5XeW/X8m8Q3cU6GBH7QFQS1twDYP+fNWgEMzpGLfhn5I7OSS5FMtFCEE13YbvAskT/7ddG6kUjpKt/zroo5LQBhIiScxFHJJA43ayC7d+9W9Xr91igVNIqVghzHQSaVeuLYyy+PNLvmHt21K9la9O5ZVyuvSVPdKAIrxFxXFrkAamQKxWw1QUKtypOuajlt5Wt3f+aGG1ZSnFsD0AsvvDCVSmX/xrFtAEJRgYBoHQiAN+0IufqcxuE8eTtzc+5/zsOylpYwZzCos18XLUp8v/bmQAdtkSFIQJjC6TjOD4YOHRprftj79x/r8rz6DRGgGznWiUSi7Lrud+Mnvif6zuhI6Q2JWumtOVOUBGtSBHCcALPoBUiDCCR2nwngkCYXZaFq/jXpavBTAPCRJh3eSSWeUpY9DqCRyGSMoXq9tmV8vNJ1DsPnSvSAXHJiOheclboAt91yWq5btmzpKJWKv6h1gCjsLQA4kUjoZDr1ndkPVnxvg+d5q2NuHkcWk6474LruoSbuLHv27GFTL77T9UoZRb6EPI8QSyrTdGlagDe1Ee8mAEIIANQBBBASrktCl22rWv2Fl/fsdu4DzJ7YW5PNHkomkweUYoSJN0LGGASB38Vc75vzZlPzoUkACP//xKBlvjJAIxelciwHoKVcqL09CPxrtTYCgI0xwsxIpdwDWXfl3tlcQVnSp3WQafZXW5YF27L29/X1jQCNRCOxnnhifcqr7koaTzwAWmiWqImSZEER16YF6NAx+AkSufaiF7F4cLzq65776oHtzd/r37cvn3Sc/XaUMxylbUoQBEktsmExvJAjfzamc0ku5EU/VohWc4MnZEilKwLQBEBee91rV9X8ym/5vt+cgUaO4yCRcr+yf/+zw7M1Aw3qjnKDG3onKwVL2Ycff/xx3TzfrFfd3ubVNyTgk4YKM8pFYCR0fyzWwDECBI1UWwI3kQAB5JCG5VU6K4Xq9QitvUayFgOHlIpz9EPTQWsNElo7P57NWRNkpciykrEqH0Q/F/u6IM6mlDW3mnlJlJCli0ZaywRoM1ad+I1arXpTEASNXGhmZtd1j1uMLzeDH426PlmDmQWrBACG5PRZD7+qexPGTzIFEjrozjaLF7NLjdIRCV16IIKChBGV0L0nSROQo3UPADwGGIoBzTwUKQqNyuHox6r5YSGzk7EQ+L5VrRZ/Zf363h5mJJqr8plBDCYwU0xFkVsljKOypYgkAcv69qsvvfQ9LE0xcsRolleLpiW92hJ7fwCYa6+98TXDZ07fXS6XZyRtW5YFUuoLAwMDrzZJlrgola7dvj0XaD2TdInAIoVZBIAacdaDBd+wpK2AGAbBeRWLc3Aoooa8lugREqjBO3wxYhtDq7TqBhPIiOwG8DgAYyfLwrHKEa7XGANtAvd8dkbzqFQq8P3BX2alfplmMbA5rcpZleu2bWPVqlV9RPS9OBFsUaCe85Mi0MvneVGQuRfHlx/QBMBs2XJTx5kzpz5RmJpabYyJE+INM7PtJJ5l4LNzffmOO+5gHehE8wNq7OdctfwBHNsACQ6NqaVInKDzUKoiA0/LWSVNZEjDxFU+0/M32nCjFmqWH5qGzhazIgLP85qr0Jtd6OcDqLEsi7U2P1469DJw1KUCM+3atcsqFofvKxQn/7XneYbDFDshIkokk6Vkwv3D0dHRYcxR2fHYY48ZIvaauU+jl4YxZxGeTewniJCIstb0MgcFFAEWMTRTJax9msa/bYzNOv69qe8HqwDT/vfFbH1zG4VFpVAauTBAMxfl8kV25tKhCcyti56QtYSANseOnfr1fH7yN+u1ujBzg7M4jsNpN/Pg2NjIk3OAOe7nIdu2XZOfJUZDDZaoZQ48FAwzyIQCWUOWzWUjkTEeEKOicAYS+qIfjxcvlOY4GYQa+bywLK7OqZNqTfN1rbJtm5oLZedTN2arHSLCtm2DI+t00WMKmAvRyw5xtbRa71JcTQHQPeuv+rnxybGPVasVO+bKxhhjWRan09nv2nbrJ4Ez8xWSRu/RoDUdOYoqZ0As1DV7f7Vj9xdB1Q6hVGQPLm/erjCXSGGSzZHZzzvw/FUS6v4NxqqUAgmNzdb9p1d8Nu5SrqvbOzq+CIMfKEUJgCEM4umKjhk/o5TPyDY1xMyOlUg8PUcnqItyFIcOl2Xkz0uoOlwsoBmA7u3edNtEYfTharXcLhKWb8X6s+Mk+lXSef/Q4KExnLesiI42+WFDsAQBvMDrjdKOGz0sJlPqJcvikxXP2pSCL7S8gBYjTDXbGSyn7eeaJTxEKFizbouYoFnPZWKGAR07BxeYXX1OSql60nW/ePTgwf9zJemlmn58wvF8kd81fX1bduXL458rFPJdWmsT9XAQIuJ0OjOayeTuGR0cfB4LqJETCY7alp1vJl1jDIzWW2+88cYVABBXZ38/lzttMqmn67YDFgVFvIwcRIRIwbISz/W/NnOg+W/XXf9TblVXNwVyVuu3spbg5Nw+XxXHfmbqv1qzrmsnknpxi4lLF1gxC3Z9LLlKt6CpLCOgFQDT09O3a2Ji9NF8Pt8TVbvE7Q8okUxVksnU746MDP79AsAsAOCKeyKZSg0rpQAgzHsTQa1W6y0Wi1djui0B7927N1AZ+ytly64YA1IQoch+kgZWojC4yKIiqRTFGWOGqw2oyk6QyuT+/pFH9vl7ptse0FS5f3Pdr28LjAHHrZaYkXASQ2JZRxeFnWksxnmulyywcq4HQ/rSW4sEXJLQdxwd093dm96Uz088WijkN8ZV0PH60+lMkEln7hsdHfk8FtirAgAynZlRW9mv2Lbd6CIkIuLV6zlf69tji/8j0fUmWlZ9u5hOPVWy7On2QyAYYYgQVHTrQOIgRDNQY+hLBFsBxwQhIXt0wt6BxheHisn0vuc7nb8FgI80eR2sur5NqmaFBiTM8Q/1Z9u2X7l63bqh+ZgQ0RwOWAKg5Epzu8nyatBLe3VeJJgBwHSv7X5nPn/mL/P5qY1BoOOqEgFAqVQqcN3s/aOjIw9g4d3vBRHXZaLvRhw69hqI53molCrvuO6661bFf9gD8H1795Zybe1/lndbinljc11YvMhU92DgRW7cJDNsomm2JyHXDgsIohZcUXZ92RDyhlAVwAhJIIqCVEvQ0t7y6B98//nRKA8biBpblguVn/d8HyCINhoUdfJhtp6KekqfTdBTgNZz1qvQ5a2SlTnfouVMaT3Hepcz264BzA3re3+1WC4+UiwWusISqYY6QalUqppKpf/gzJnBP8LM7koLHgk38S2AhjAdSWRjjJTKxesmJwvviKXAfVGdX1em5Zv5VPbTIyqt69qGghKbDBQAD4K6iTUkho7zPObaV2H44iAIOztAAUJiSQ0ulXO5LzpbV39JAPpIU4BjrDj2jkqt/K80tIDDfRARsmznFOA+Nd8aS5Yts0LfV/bQy8ejI2KRuTzxy8WhGYDsxm7V1bXu3omp0QcLxUJ7XO+HqClNIpEoJZPuB8fHRz+ORfd5a6iVdODAq4fdVPqJRCLR6LFGRFL3alwoTN7V3d29Jv4sAXjj3r3BkWrHR3Uq8xee5RJEUYrIpDhu1iHwxDT6HDCFQRLVVIIVNpEzMPCRYY0OJZIEiY8017NtXzuZkv/8xsf3lprElGxas2NFsVi4q+7VlUAaBp5jO3DT6a8PDR06iAvoZyJyZWXLRdksl4n4CksOaAZgduzY4X5/zdMfm8pPfrxYLKZNWE/VcM2lUumxVCZz18TEWFzAeqGJMQSQpBO5R5WyJhAFXACwaJFKpXytX/PfN/P5g/741NPVtu51H5zKZf7HqHJNTdtMApMgSIIAizSYdAjiaFGqwbfR0KGTHIhLxkBANZXjfLbtG+jK3fU7L/afiVSNBneu6fE7fePt8KEFRAyBMDM5yUTJsZz/CSy/b/yfz5BL4uWI3HJ9606dHnqkUJi4t1qpTANMxCjFnEy5Rx0n8e6J0dEv4OLPIBEAtKGva5/rpp+wbZu01o2UhiAIpFIp3HlVT8/PRWtWcYuBO55+emJqzdp7prK5e49audMj2uW6tonBxgaMAkRLLOcJBgQDiA9IIGQMYAIDKhqLh1Tr5Eim9eOVrvS773jmxWORV8PE3p1NGza9pVSd+k9lrxIluwogEMuyKO2mv2pZG//vhe0DXZFYCy75TcN26RfyTWueXSUAZuXKtdePjk48VKuXb6nX6hInvgNilFJsJ5LPprJtd44Pn3wOS3OEW8M43Nx77UO+773N9/0VYe9UJoiYSrWSLhTyn9jcu7n/YP/BlyJQh/05nn66CuCPP9Xb+71aNf276XrtZ9p1JamlDkYAISAQEY48G2FfDoIBiJBAnh2/bNnfMa0tn3zP0ePfwkCYs0HTYNabezZvnpgc+WShXGgzJAYEhkDIECVSqQmVSD84MLC3dn5XpVyB6KUldaFd7Chb1kUbhbGqYNau3fCWarX4v0ql/C31Wt1MJxcIOY7DyVT6647l/tsmMC+VD9QAoIP9L+9rzbU9mkgkSQRCBBCItREzVchffWZi5HPbrtrWF9nJjV7KAtD7+/ufW/H6m3/FtK/4lVKm9UvDnHx+1DgjFUn6NaTIpwwFlKE6Z1DnbMFY6cOSbf8KrVj9bqe37473HDn2LYhQU4W3AqC39mzdMD4x9NlCKb81MGHzyOgTknSSlHEznx88cfTphahc8xTJXjaQGzFhVcM8QYfLQUgXy6EZgNm2bbeTzz9zZ6mU/3ClUmozxsSdNkUxk+04Jpl0H85m0x8+ceLEJJbvDEJRdvaTmXT5liDwbwmCwDARGwGbwJhiqXQzaORLGzdufM+xY8dexPTJNLIH4Dsef9wD8NcQ+cqntm5dnZ4sdnvK2iiC1QnlZBiAMEYU8RHlOAOr3vjak2995BE/Dtzc15TAD0Bfc/WNW0cmBx+ZqpRfr01YrCAQiBFjWRYnUql/dBzrEwsxiDOBT8w0RyX4ZfRDtwA0delvLUrR7LSFpWinwABwQ98NKzs7Vz+SzWZ13Cs65tjMJCnXLa9atfoD27Ztc5oIgrE8NXAEAJs2brqpra3teJSIM6M3s1JKWlvbDq9Zs+7nZzEUwsX1h57RC3t918afaWlpfdWyLEHUPzvu7czM0tLSNrB+fe9rFmCXEADs2rWrtbNzzTPxmmLplslk6ht6e5etF/O55rRt27b2lpbWs/pDpzOZSnd375uWYU4MANdd9xNvbm9vr2O6aEgTkXSsXLlv286d7Ytl4VasL2/YcO2WocLwp/OFqTfXarU4k4tDIlKUyeROWFbq7jNnBp84c2Z4ecI8c+jTh44denbt2o33am3+vFgs5GI3YZwAVSzm+2q12hc7Wjo+vaZ9zUMvH2v07ojD0zyrg38j0veRWRt1X/iKXW2yefONXWNjQ3eNT525u16vZeIWulE+tAnzVdKFTCb7gZMn+59bqLQK00evNAswB6Kh8x3EuuRDqfnyyi7slhYA6enp+6lSaeSBQiG/PUrMn44kA0in0+jsXP0cG651ruj4Wdu2lbCwSECAImEhFmYoFetbEgb7wt/IhK2ImkQKKYA87Vme5+175ZVXXp1HTBsAfPr0sb9av37DShF5oFwuulEnMQ4jlDD1ei0rgfnQCe/U21avXv9Ia+uqJw4c2DfUBNQZzXPuOzvTbQYIN2++satcnvqFkZGBX69USjdE53/EEVEAMIqJU6l0pTXb/nsnTw/81VKoXgJgOcudzqlDm3mJjC6VlJjBvgmUDgl/cYBevbpnVz4//heFQmGt1loT0ezTi6hWq2F4+PTbiehnI+5IcwUEpk8jijzK5/A4igmjjG4280UR+dW4qcw8oKaTJwf++5o13b6IfKJarbRG7X85Pg/G0x68wP8JT7zPVirlu1e0d349YSe/1p7IPf/yyZcnz9Xniohw9eqrV5RN7bqKV/nJwcH+txkTbK9UKxAT9gZpOndGwmLfzFTWzX3g5ODAXyzW714sKiESc9YuiogmfWVFEAWiG/XwSz/0PO5NARGQWzyHTib5+ny+tjYSp2r2gwYA3/cRHeqy5CORSHYsEBA0NHTic2vWrB+1LOuBUqnYp7WW6DxBDn1LxtRqFfLq1Wscy7mmRnxn0YwcTCvnJSI+pSz7tGWrCbIsbcTYfq3W5gfBGkfQMzRxcnudpM8Y7QZBAIRAjg9QQhRMItu2OZFIHnXdzPsGR0599YJ871NT0Pqsk3khIqK1NpcDt8zlOcPxAkGwnFJD05zJCASRsiovvgTLtm1hVvERCuYc1qbMBfa5P0/nP1cvbGsgQuRhYclLFIL65N91dW0YYFb3Vyqln/E8j0x4QAgxNxLmTN2vow64zHwjgBsBgMQDawViBoigAx9Ga9RDiRE/ToPQ7ubQWxgaoczMiUQCjpN80rZTHxoZGfzRhfrei8oSY7SZLcNExBjPXJ70pEJ0TNxcex8sI4cOA2dythsRcgGRb1ieF9iAKGaKfKPS8PvLOdjPnHVUNH3ip8zZiUKaOAIpZoIiSi+QQzfO3h4cHHi+t7f33zGrd/tB/Z5yudSr/QDQMJGmTPERFZrMdG8wTYTATBezEglIpgvGw3Onw3OeQSZ8wsKWZZGbco85idSnjcl+fmzsSOFideawFkJmEIMxBsFliMsBQImVmBBbUe/q6QMxg2XUo3VdN24Vv8LDDDUZs3g/olWv1/cnU6lvJpIpN3yIpgHpqP1LeJOmTj9x3i8xKOrFT8yg+PA9nqO8yBjBdA0AoBQBgJN00/+ExR0MYwBwf39/HsCfrO9c/23F1m9Xq5V3+n7Yh1qinomNnvtNR1YKJJpm9HuYl4/pZNJIgSOQsiwoZY0lk+7jrpv9k6GhgQPACC4WzOWyH4iYSiKZJIio2PYgZmOM8S4HoKtV7QuZiuu6FNpRUYMdpYK65y3bnEpBqQ6In0qlEpZlkTEmrPQH6tVqddHSigDQunU7k7rTJzViz91xXiXOfr8H6AFQr9cJWB/p2tWzKMq2UzLX+1gDtNfrNDEx4e3bt8+/QMs4UpMInZ1rb/b92ju11m/xvNpmrbWjtUZ8GFKDRmVuozCUGhxVa9u1RCJ5RIS+atvOX4+NDe+LaG0pwvsAQG1tK1+nHGuLo5ThaASBVyiXy9/I5/NTWMLORwudU6a19fWuk9rqOMrE3qh6PSiM+bVvYOnnRACkra2txSLrNivhdNgJGzCAp332g+DQ+MjI3sUyjn8O2WAzuOW6dVev9bzyDiG5KfDr1wVBsCnw/VWe56cBsREmVsXtAQQg37JU0bbtYWU7RxzLfkEp6weW5b5w6tTh0/Pd51/GlTnoCgG2LME6zqqO2blzZ2p0dHTtVKm0zq96qwG0CSEjIpZSpI1QzSIaSyTs01kne7KLugb3holF57zuEhIizbEPl/58wss7p/ka7MuFMJD/B3bmT8ky2GkdAAAAAElFTkSuQmCC';
// ── 20FIT product illustration (flat 2D SVG, 1:1) ─────────────────────────────────────────────
// Shown for a product that has no photo in the POS. Drink = 20FIT takeaway cup (small cup for
// espresso / piccolo, paper cup for hot drinks) with the official 20FIT logo (embedded PNG, not
// redrawn); food = pastry on the red checkered paper of the product photos. Colours come from
// the product name (keywords) or else the category. One-shot animation (~1.6 s, never loops),
// off with prefers-reduced-motion.
const ART_BG = '#f4ebe7';
const ART_RULES = [
  // [regex on name, kind, layers bottom→top [colour, share], extras]
  [/espresso/i, 'small', [['#3b2416', 1]], { crema: '#b9844f' }],
  [/piccolo|cortado/i, 'small', [['#6b4226', .45], ['#e8d3b8', .55]], { foam: '#f6eee3' }],
  [/hot|panas/i, 'hot', [['#6b4226', 1]], {}],
  [/berry americano|strawberry americano/i, 'iced', [['#b3263e', .4], ['#3a2416', .6]], { ice: true }],
  [/orange americano/i, 'iced', [['#f29a2e', .45], ['#3a2416', .55]], { ice: true }],
  [/double load|ristretto/i, 'iced', [['#2f1c11', 1]], { crema: '#a8743f', ice: true }],
  [/cold brew|long black|americano/i, 'iced', [['#3a2416', 1]], { ice: true }],
  [/shakerato/i, 'iced', [['#5b3a24', .78]], { foam: '#caa27a', foamH: .22, ice: true }],
  [/strawberry latte/i, 'iced', [['#e46a86', .35], ['#efe3d3', .4], ['#8a5a36', .25]], { ice: true }],
  [/latte|cappuccino|magic|aren|cloud|oat/i, 'iced', [['#8a5a36', .38], ['#e7d0b1', .62]], { foam: '#f6eee3', ice: true }],
  [/matcha|green/i, 'iced', [['#7fae4f', 1]], { ice: true }],
  [/chocolate|choco|coklat/i, 'iced', [['#5a3523', 1]], { foam: '#8b5a3c', ice: true }],
  [/lemon|lemonade/i, 'iced', [['#f3d35b', 1]], { ice: true }],
  [/strawberry|berry|bana/i, 'iced', [['#e0496a', 1]], { ice: true }],
  [/mango|tropical|orange/i, 'iced', [['#f5a623', 1]], { ice: true }],
  [/coconut|hydrate|coco/i, 'iced', [['#f1ead8', 1]], { ice: true }],
  [/tea|teh/i, 'iced', [['#d98a2b', 1]], { ice: true }],
  [/protein|endurance|almond|nutrition|peanut/i, 'iced', [['#b98a62', 1]], { foam: '#e6d2bd' }],
  [/chia|pudding/i, 'cup', [['#efe7f2', .55], ['#c9b8d6', .45]], {}],
  [/croissant|danish|nutella|sausage|cake|bread|toast|sandwich|pastry|bun/i, 'food', [], {}],
];
const ART_CAT = { coffee: [['#8a5a36', .38], ['#e7d0b1', .62]], tea: [['#d98a2b', 1]], smoothies: [['#e0496a', 1]],
  signature: [['#b98a62', 1]], hybrid: [['#7b4a2e', 1]], chocolate: [['#5a3523', 1]], chia: [['#efe7f2', .55], ['#c9b8d6', .45]] };
const artCache = {};
function artSpec(name, category) {
  const n = String(name || ''), c = String(category || '').toLowerCase();
  if (/food|makanan|pastry|bakery/.test(c)) { const r = ART_RULES.find(x => x[1] === 'food' && x[0].test(n)); return { kind: 'food', layers: [], x: {}, food: n }; }
  const r = ART_RULES.find(x => x[0].test(n));
  if (r) return { kind: r[1], layers: r[2], x: r[3], food: n };
  if (c === 'chia') return { kind: 'cup', layers: ART_CAT.chia, x: {}, food: n };
  return { kind: 'iced', layers: ART_CAT[c] || ART_CAT.coffee, x: { ice: c !== 'signature' && c !== 'hybrid' }, food: n, fallback: true };
}
function artLogo(cx, cy, w) { const h = w * 53 / 180; return `<image href="data:image/png;base64,${ART_LOGO}" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}"/>`; }
function artLayers(layers, top, bottom, xl, xr) { // stacked rectangles, clipped to the cup body
  let y = bottom, out = ''; const H = bottom - top;
  for (const [col, share] of layers) { const h = H * share; out += `<rect x="${xl}" y="${(y - h).toFixed(1)}" width="${xr - xl}" height="${(h + 1).toFixed(1)}" fill="${col}"/>`; y -= h; }
  return out;
}
function artCupBody(t, b, tl, tr, bl, br) { return `M${tl} ${t} L${tr} ${t} L${br} ${b - 10} Q${br - 2} ${b} ${br - 12} ${b} L${bl + 12} ${b} Q${bl + 2} ${b} ${bl} ${b - 10} Z`; }
function productArt(name, category) {
  const key = String(name) + '|' + String(category || '');
  if (artCache[key]) return artCache[key];
  const s = artSpec(name, category); const x = s.x || {};
  const css = '<style>.p{animation:pop .9s cubic-bezier(.2,.8,.25,1.15) 1 both;transform-origin:200px 352px}.i{animation:bob 1.6s ease-out 1 both}.i2{animation-delay:.12s}.i3{animation-delay:.24s}.b{animation:rise 1.7s ease-out 1 both;opacity:0}.st{animation:steam 1.8s ease-out 1 both;opacity:0}'
    + '@keyframes pop{0%{transform:scale(.93)}100%{transform:scale(1)}}@keyframes bob{0%{transform:translateY(-14px);opacity:0}60%{transform:translateY(2px);opacity:1}100%{transform:translateY(0);opacity:1}}'
    + '@keyframes rise{0%{transform:translateY(16px);opacity:0}30%{opacity:.85}100%{transform:translateY(-70px);opacity:0}}@keyframes steam{0%{transform:translateY(8px);opacity:0}40%{opacity:.7}100%{transform:translateY(-26px);opacity:0}}'
    + '@media (prefers-reduced-motion:reduce){.p,.i,.b,.st{animation:none!important}.b,.st{opacity:0}.i{opacity:1}}</style>';
  let g = '';
  const shadow = '<ellipse cx="200" cy="356" rx="92" ry="11" fill="#0d0d0d" opacity=".10"/>';
  if (s.kind === 'iced' || s.kind === 'cup') {
    const T = 118, B = 350, TL = 116, TR = 284, BL = 142, BR = 258, liq = 136;
    const body = artCupBody(T, B, TL, TR, BL, BR);
    let fill = artLayers(s.layers, liq, B, 100, 300);
    if (x.foam) fill += `<rect x="100" y="${liq}" width="200" height="${((B - liq) * (x.foamH || .1)).toFixed(1)}" fill="${x.foam}"/>`;
    if (x.crema) fill += `<rect x="100" y="${liq}" width="200" height="9" fill="${x.crema}"/>`;
    if (s.kind === 'cup') fill += '<g fill="#3a2a3f" opacity=".55"><circle cx="160" cy="300" r="2.4"/><circle cx="185" cy="318" r="2"/><circle cx="215" cy="290" r="2.4"/><circle cx="238" cy="312" r="2"/><circle cx="200" cy="335" r="2.2"/><circle cx="172" cy="270" r="2"/><circle cx="228" cy="262" r="2"/></g>';
    const ice = x.ice ? '<g fill="#ffffff" fill-opacity=".38" stroke="#ffffff" stroke-opacity=".75" stroke-width="2">'
      + '<rect class="i" x="138" y="140" width="40" height="38" rx="8" transform="rotate(-8 158 159)"/>'
      + '<rect class="i i2" x="186" y="146" width="38" height="36" rx="8" transform="rotate(10 205 164)"/>'
      + '<rect class="i i3" x="226" y="138" width="36" height="35" rx="8" transform="rotate(-4 244 156)"/></g>' : '';
    const bub = '<g fill="#ffffff" opacity=".7"><circle class="b" cx="165" cy="320" r="4"/><circle class="b i2" cx="232" cy="300" r="3"/><circle class="b i3" cx="200" cy="330" r="3.5"/></g>';
    const straw = s.kind === 'iced' ? '<rect x="226" y="36" width="12" height="96" rx="6" fill="#0d0d0d" transform="rotate(14 232 120)"/>' : '';
    const lid = s.kind === 'iced'
      ? `<path d="M120 112 Q200 70 280 112 Z" fill="#ffffff" fill-opacity=".55" stroke="#0d0d0d" stroke-opacity=".12" stroke-width="2"/><rect x="106" y="106" width="188" height="16" rx="8" fill="#ffffff" fill-opacity=".85" stroke="#0d0d0d" stroke-opacity=".12" stroke-width="2"/>`
      : '<rect x="106" y="106" width="188" height="16" rx="8" fill="#ffffff" fill-opacity=".9" stroke="#0d0d0d" stroke-opacity=".12" stroke-width="2"/>';
    g = `<defs><clipPath id="c"><path d="${body}"/></clipPath></defs>${shadow}<g class="p">${straw}<g clip-path="url(#c)">${fill}${ice}${bub}`
      + `<rect x="${TL + 12}" y="${T}" width="10" height="${B - T}" fill="#ffffff" opacity=".28"/></g>`
      + `<path d="${body}" fill="none" stroke="#0d0d0d" stroke-opacity=".14" stroke-width="2.5"/>${lid}`
      + `<rect x="140" y="214" width="120" height="58" rx="12" fill="#ffffff"/>${artLogo(200, 236, 92)}`
      + `<text x="200" y="262" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="11" letter-spacing="2.5" fill="#e30a2e">CAFE</text></g>`;
  } else if (s.kind === 'small') {
    const T = 214, B = 350, TL = 134, TR = 266, BL = 152, BR = 248, liq = 226;
    const body = artCupBody(T, B, TL, TR, BL, BR);
    let fill = artLayers(s.layers, liq, B, 120, 280);
    if (x.foam) fill += `<rect x="120" y="${liq}" width="160" height="14" fill="${x.foam}"/>`;
    if (x.crema) fill += `<rect x="120" y="${liq}" width="160" height="12" fill="${x.crema}"/>`;
    g = `<defs><clipPath id="c"><path d="${body}"/></clipPath></defs>${shadow.replace('rx="92"', 'rx="72"')}<g class="p"><g clip-path="url(#c)">${fill}`
      + `<rect x="${TL + 10}" y="${T}" width="8" height="${B - T}" fill="#ffffff" opacity=".28"/></g>`
      + `<path d="${body}" fill="none" stroke="#0d0d0d" stroke-opacity=".14" stroke-width="2.5"/>`
      + `<ellipse cx="200" cy="${T}" rx="66" ry="6" fill="${x.crema || x.foam || s.layers[s.layers.length - 1][0]}" stroke="#0d0d0d" stroke-opacity=".12" stroke-width="2"/>`
      + `<rect x="152" y="270" width="96" height="44" rx="10" fill="#ffffff"/>${artLogo(200, 287, 72)}`
      + `<text x="200" y="306" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="9" letter-spacing="2" fill="#e30a2e">CAFE</text>`
      + `<g class="st" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".0"><path d="M182 196 q-8 -14 0 -26 q8 -12 0 -24"/><path d="M216 196 q-8 -14 0 -26 q8 -12 0 -24"/></g></g>`;
  } else if (s.kind === 'hot') {
    const T = 132, B = 350, TL = 126, TR = 274, BL = 148, BR = 252;
    const body = artCupBody(T, B, TL, TR, BL, BR); const col = s.layers[0][0];
    g = `${shadow}<g class="p"><path d="${body}" fill="#ffffff" stroke="#0d0d0d" stroke-opacity=".12" stroke-width="2.5"/>`
      + `<path d="M${TL + 9} 196 L${TR - 9} 196 L${TR - 19} 292 L${TL + 19} 292 Z" fill="${col}"/>`
      + `<rect x="140" y="214" width="120" height="58" rx="12" fill="#ffffff"/>${artLogo(200, 236, 92)}`
      + `<text x="200" y="262" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="11" letter-spacing="2.5" fill="#e30a2e">CAFE</text>`
      + '<rect x="114" y="112" width="172" height="24" rx="9" fill="#f7f4f0" stroke="#0d0d0d" stroke-opacity=".12" stroke-width="2"/><path d="M128 112 Q200 88 272 112 Z" fill="#f7f4f0" stroke="#0d0d0d" stroke-opacity=".12" stroke-width="2"/>'
      + '<g class="st" stroke="#c9bdb3" stroke-width="5" stroke-linecap="round" fill="none"><path d="M180 84 q-9 -14 0 -26 q9 -12 0 -24"/><path d="M220 84 q-9 -14 0 -26 q9 -12 0 -24"/></g></g>';
  } else { // food: pastry on red checkered paper
    const n = s.food.toLowerCase(); let pastry;
    if (/danish|cake|cheese/.test(n)) pastry = '<ellipse cx="200" cy="236" rx="86" ry="56" fill="#d9963e"/><ellipse cx="200" cy="228" rx="74" ry="46" fill="#efb85c"/><ellipse cx="200" cy="226" rx="38" ry="24" fill="#fbe7a6"/><ellipse cx="192" cy="220" rx="14" ry="7" fill="#fff6cf" opacity=".8"/>';
    else {
      pastry = '<g stroke="#b97526" stroke-width="2.5">'
        + '<ellipse cx="120" cy="250" rx="34" ry="24" transform="rotate(-35 120 250)" fill="#d99a3d"/><ellipse cx="280" cy="250" rx="34" ry="24" transform="rotate(35 280 250)" fill="#d99a3d"/>'
        + '<ellipse cx="152" cy="226" rx="40" ry="34" transform="rotate(-18 152 226)" fill="#e9ad4f"/><ellipse cx="248" cy="226" rx="40" ry="34" transform="rotate(18 248 226)" fill="#e9ad4f"/>'
        + '<ellipse cx="200" cy="214" rx="46" ry="40" fill="#f2bd5f"/></g><path d="M176 196 q24 -12 48 0" stroke="#fff1c7" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>';
      if (/sausage/.test(n)) pastry += '<rect x="132" y="224" width="136" height="26" rx="13" fill="#a8452c" stroke="#7e2f1c" stroke-width="2.5"/>';
      if (/almond/.test(n)) pastry += '<g fill="#f6e2b8"><ellipse cx="180" cy="206" rx="9" ry="4" transform="rotate(-20 180 206)"/><ellipse cx="206" cy="198" rx="9" ry="4" transform="rotate(15 206 198)"/><ellipse cx="226" cy="212" rx="9" ry="4" transform="rotate(-10 226 212)"/><ellipse cx="162" cy="226" rx="8" ry="4" transform="rotate(25 162 226)"/></g>';
      if (/nutella|choco/.test(n)) pastry += '<path d="M150 210 q50 -24 100 0" stroke="#4a2a1a" stroke-width="9" fill="none" stroke-linecap="round"/>';
    }
    g = '<defs><pattern id="ck" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#ffffff"/><rect width="20" height="20" fill="#ec5a63"/><rect x="20" y="20" width="20" height="20" fill="#ec5a63"/></pattern></defs>'
      + '<g class="p"><path d="M200 120 L330 240 L200 360 L70 240 Z" fill="url(#ck)" transform="rotate(8 200 240)" opacity=".95"/>'
      + `<ellipse cx="200" cy="262" rx="104" ry="18" fill="#0d0d0d" opacity=".10"/>${pastry}`
      + `<g transform="rotate(-8 300 330)"><rect x="252" y="314" width="96" height="34" rx="8" fill="#ffffff"/>${artLogo(300, 331, 74)}</g></g>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">${css}<rect width="400" height="400" fill="${ART_BG}"/><circle cx="200" cy="190" r="150" fill="#ffffff" opacity=".35"/>${g}</svg>`;
  return (artCache[key] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
}
window.CafeArt = productArt;
// Every product photo on the site (landing sections, FULL MENU, product view, checkout) is the POS photo; a POS product
// without a photo shows its 2D 20FIT illustration. The site keeps no menu photos of its own.
const photosFor = it => (it.image_url ? [it.image_url] : [productArt(it.name, it.category)]);
// Server menu item -> view model used by this page and the checkout
// Display category: a POS category can be shown under another one (StoryConfig.menu.merge, e.g. Chia → Food).
const catOf = c => { const mg = ((window.StoryConfig || {}).menu || {}).merge || {}; return mg[c] || c; };
// Group order from StoryConfig.menu.order ('*' = any category not listed); drinks first, food last.
const catRank = c => { const o = ((window.StoryConfig || {}).menu || {}).order || ['*']; const i = o.indexOf(c); return i >= 0 ? i : (o.indexOf('*') >= 0 ? o.indexOf('*') : o.length); };
const toItem = it => ({ id: it.id, name: it.name, cat: catOf(it.category), price: Number(it.price_display) || 0, base: Number(it.price) || 0, description: it.description || '', available: it.available !== false, addons: it.addons || [], imgs: photosFor(it) });
const defaultOpts = m => (m.addons || []).map(g => { const d = (g.options || []).find(o => o.default) || null; return d ? d.id : null; }).filter(Boolean);
const lineKey = (id, opts) => id + (opts && opts.length ? '~' + opts.slice().sort().join(',') : '');
const optsPrice = (m, opts) => (m.addons || []).reduce((a, g) => a + (g.options || []).filter(o => opts.includes(o.id)).reduce((b, o) => b + (Number(o.price) || 0), 0), 0);
const optsLabel = (m, opts) => (m.addons || []).map(g => { const o = (g.options || []).find(x => opts.includes(x.id)); return o && !o.default ? o.label : null; }).filter(Boolean).join(' · ');
// Hero chips (StoryConfig.needs) and the product card under the hero (StoryConfig.heroPicks, by web menu id).
const NEEDS = () => (window.StoryConfig || {}).needs || ['Fresh', 'Fueling', 'Light energy'];
const MENU_CACHE = '20fit-menu-cache-v1';
// Neutral grey placeholder shown under each Instagram slide only until its embed loads — never a product
// photo, so the hero only ever shows real Instagram content (and the box is never empty while loading).
const IG_PH = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4/uwxAAVoArHU0TkJAAAAAElFTkSuQmCC';
const IG_DEFAULT = 'https://www.instagram.com/reel/DZMf2F3y_6X/';
const IG_POSTS = ['p/DcTitnFEhQo', 'p/DeG5fVWyR1C', 'p/DY1wzVJSFAU'];
const IG_POSTERS = ['DSC3568', 'DSC3733', 'DSC3737-1'];  // real cafe photos shown instantly behind each hero IG embed (so the hero never sits on a grey skeleton)
const IG_CROP = { p: { left: '-2px', top: '-55px', width: 'calc(100% + 4px)', height: 'calc(100% + 55px + 480px)' }, reel: { left: '-21.1%', top: 'calc(-58px - 21.2%)', width: '142.2%', height: 'calc(160% + 58px + 480px)' } };
const IG_MS = 7000;
const igId = u => { const m = /instagram\.com\/(p|reel|reels|tv)\/([\w-]+)/.exec(u || ''); return m ? (m[1] === 'reels' ? 'reel' : m[1]) + '/' + m[2] : ''; };
const rp = n => 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID');
const API = () => window.CafeApi;
const SC = () => window.StoryConfig || { chapters: [], stops: [], needs: ['Fresh', 'Fueling', 'Light energy'], sky: [], teasers: {} };
const TRACK = (e, p) => { try { window.track && window.track(e, p); } catch (x) {} };
const clamp01 = x => Math.max(0, Math.min(1, x));
const reduceMotionNow = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const hexToRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixRgb = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
// Story layout: horizontal pinned day on wide screens; vertical list on phones or with reduced motion
const storyFlat = () => !!(window.matchMedia && window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches);
// Phone width only: the day section falls back to a vertical scroll list here; wider screens auto-advance the carousel.
const dayMobile = () => !!(window.matchMedia && window.matchMedia('(max-width: 767px)').matches);
// Transparent cut-outs (PNG) are shown whole; the SVG product illustrations fill the photo box like a photo.
const isCut = src => !/^data:image\/svg/i.test(src) && /^data:|\.png($|\?)/i.test(src);

class Component extends DCLogic {
  vid = React.createRef();
  state = { igI: 0, igHold: true, hy: 0, hx: 0, hyM: 0, hon: false, need: 1, heroIn: false, sound: false, tab: 'All', sel: null, cart: (window.CafeApi && window.CafeApi.cartGet ? window.CafeApi.cartGet() : {}), checkout: false, resume: null, full: false, hist: false,
    menu: null, menuErr: '', refs: [], hList: null, hErr: '', hLoading: false, hOpen: {}, hFlash: {}, hDot: false, rates: {}, findCode: '', findPhone: '', findMsg: '', findBusy: false, toast: null, pick: {}, vAdd: {}, vAddBusy: {} };
  rail = React.createRef();
  careVid = React.createRef();
  day = React.createRef(); dayStage = React.createRef(); dayTrack = React.createRef(); dayHand = React.createRef(); dayMin = React.createRef(); dayTime = React.createRef(); dayTime2 = React.createRef(); progBar = React.createRef();
  // ---- landing story (CH 03 'A day, fueled' + chapter navigation) ----
  storyTick() {
    const cfg = SC(), stops = cfg.stops, n = stops.length;
    const H = document.documentElement, max = Math.max(1, H.scrollHeight - innerHeight);
    if (this.progBar.current) this.progBar.current.style.transform = 'scaleX(' + clamp01(scrollY / max) + ')';
    // active chapter + one 'story_chapter_view' per chapter per session (>= 50% on screen)
    let ch = 0;
    (this._chs || []).forEach((c, i) => {
      const el = document.getElementById(c.el); if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top <= innerHeight * 0.45) ch = i;
      const vis = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
      if (vis >= Math.min(r.height, innerHeight) * 0.5) { window.trackOnce && window.trackOnce('ch:' + c.id, 'story_chapter_view', { chapter: c.id, index: cfg.chapters.indexOf(c) + 1 }); if (c.el === 'finale') window.trackOnce && window.trackOnce('finale', 'story_finale_view', {}); }
    });
    if (ch !== this.state.ch) this.setState({ ch });
    // CH 05: headline reveals word by word with the scroll; the polaroids close up
    const head = document.querySelector('#care [data-head]');
    if (head) {
      const r = head.getBoundingClientRect(), pr = reduceMotionNow() ? 1 : clamp01((innerHeight * 0.9 - r.top) / (r.height + innerHeight * 0.45));
      const ws = head.querySelectorAll('[data-w]'), n = ws.length;
      ws.forEach((w, i) => { const o = 0.15 + 0.85 * clamp01(pr * (n + 2) - i); if (w._o !== o) { w._o = o; w.style.opacity = o.toFixed(3); } });
    }
    const pol = document.querySelector('#care [data-pol]');
    if (pol) {
      const r = pol.getBoundingClientRect(), pr = reduceMotionNow() ? 1 : clamp01((innerHeight - r.top) / (innerHeight * 0.85));
      [...pol.children].forEach((c, i) => { const d = i - 1; c.style.transform = 'translateX(' + (d * (1 - pr) * 38) + '%) rotate(' + (d * (4 + 10 * (1 - pr))) + 'deg) translateY(' + (Math.abs(d) * 14 * pr) + 'px)'; });
    }
    // CH 03 — a native horizontal scroll carousel on every width (swipe / trackpad / drag / arrows / dots); the
    // clock, sky and active stop follow its scroll position (see daySync).
    const el = this.day.current, stage = this.dayStage.current, track = this.dayTrack.current; if (!el || !stage || !track || !n) return;
    this.daySync();
  }
  // Day carousel: native horizontal scroll drives position on every width. Each stop has a scroll target (its card's
  // left edge at the track's left padding, clamped to the end of the row); the float position between two targets
  // drives the clock / sky / active stop, so a swipe moves the time of day smoothly.
  dayTargets() {
    const track = this.dayTrack.current; if (!track) return [];
    const cards = track.querySelectorAll('[data-stop]'), padL = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    return [...cards].map(c => Math.max(0, Math.min(max, c.offsetLeft - padL)));
  }
  daySync() {
    const track = this.dayTrack.current; if (!track) return;
    if (track.style.transform) track.style.transform = '';
    const t = this.dayTargets(), n = t.length; if (!n) return;
    const sl = track.scrollLeft; let pos = 0;
    if (sl >= t[n - 1] - 1) pos = n - 1;
    else for (let i = 0; i < n - 1; i++) { if (sl < t[i + 1]) { const span = t[i + 1] - t[i]; pos = i + (span > 0 ? clamp01((sl - t[i]) / span) : 1); break; } }
    this.applyDay(pos);
  }
  // Scroll the carousel so stop i snaps into view (dots, arrows, keyboard, auto-advance).
  scrollDayTo(i, user) {
    const track = this.dayTrack.current; if (!track) return;
    const t = this.dayTargets(), n = t.length; if (!n) return;
    i = Math.max(0, Math.min(n - 1, i));
    if (user) this._dayUserT = performance.now();
    this._dayAcc = 0;
    track.scrollTo({ left: t[i], behavior: reduceMotionNow() ? 'auto' : 'smooth' });
  }
  dayStep(d) { const n = SC().stops.length, i = this.state.dayI || 0; this.scrollDayTo(Math.max(0, Math.min(n - 1, i + d)), true); }
  // Mouse drag-to-scroll (touch and trackpads scroll natively). Snap is suspended while dragging, then the row
  // settles on the stop in the direction of the drag; a drag never fires the click of the card it started on.
  setupDayDrag() {
    const track = this.dayTrack.current, el = this.day.current; if (!track || !el) return;
    let d = null;
    const down = e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      d = { x: e.clientX, sl: track.scrollLeft, moved: false, id: e.pointerId, i: this.state.dayI || 0 };
    };
    const move = e => {
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x;
      if (!d.moved && Math.abs(dx) < 6) return;
      if (!d.moved) { d.moved = true; track.style.scrollSnapType = 'none'; track.style.scrollBehavior = 'auto'; track.classList.add('is-drag'); try { track.setPointerCapture(d.id); } catch (er) {} }
      track.scrollLeft = d.sl - dx; e.preventDefault();
    };
    const up = e => {
      if (!d || e.pointerId !== d.id) return;
      const dd = d; d = null;
      if (!dd.moved) return;
      try { track.releasePointerCapture(dd.id); } catch (er) {}
      track.classList.remove('is-drag'); track.style.scrollBehavior = '';
      const dx = e.clientX - dd.x, n = SC().stops.length;
      const to = Math.abs(dx) > 50 ? Math.max(0, Math.min(n - 1, dd.i + (dx < 0 ? 1 : -1))) : dd.i;
      this.scrollDayTo(to, true);
      setTimeout(() => { track.style.scrollSnapType = ''; }, reduceMotionNow() ? 0 : 520);
      this._dayNoClick = performance.now();
    };
    track.addEventListener('pointerdown', down);
    track.addEventListener('pointermove', move);
    track.addEventListener('pointerup', up);
    track.addEventListener('pointercancel', up);
    track.addEventListener('click', e => { if (this._dayNoClick && performance.now() - this._dayNoClick < 80) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', e => e.preventDefault());
    // any manual scroll (trackpad swipe, shift+wheel, touch) counts as the visitor taking over from auto-advance
    track.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) this._dayUserT = performance.now(); }, { passive: true });
    track.addEventListener('touchstart', () => { this._dayUserT = performance.now(); }, { passive: true });
    // ← → while focus is inside the section
    el.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      e.preventDefault(); this.dayStep(e.key === 'ArrowRight' ? 1 : -1);
    });
  }
  // Apply one point on the day timeline (pos is a float across the stops): clock, sky, photo parallax, active stop.
  applyDay(pos) {
    const cfg = SC(), stops = cfg.stops, n = stops.length; const stage = this.dayStage.current, track = this.dayTrack.current;
    if (!stage || !track || !n) return;
    track.style.setProperty('--dp', (n > 1 ? pos / (n - 1) : 0).toFixed(4));
    const i = Math.min(n - 2, Math.floor(pos)), f = pos - i, a = stops[Math.max(0, i)], b = stops[Math.min(n - 1, i + 1)] || a;
    const hour = a.hour + (b.hour - a.hour) * (n > 1 ? f : 0);
    const hh = Math.floor(hour), mm = Math.round((hour - hh) * 60 / 5) * 5 % 60;
    const tt = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    if (this.dayTime.current) this.dayTime.current.textContent = tt;
    if (this.dayTime2.current) this.dayTime2.current.textContent = tt;
    if (this.dayHand.current) this.dayHand.current.style.transform = 'rotate(' + ((hour % 12) * 30) + 'deg)';
    if (this.dayMin.current) this.dayMin.current.style.transform = 'rotate(' + ((hour % 1) * 360) + 'deg)';
    const sky = cfg.sky.length ? cfg.sky : ['#f4f4f2'], si = Math.min(sky.length - 2, Math.floor(pos)), sf = pos - si;
    const c = sky.length > 1 ? mixRgb(hexToRgb(sky[Math.max(0, si)]), hexToRgb(sky[Math.max(0, si) + 1]), clamp01(sf)) : hexToRgb(sky[0]);
    stage.style.backgroundColor = 'rgb(' + c.join(',') + ')';
    const dark = (c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11) < 110;
    if (stage.dataset.dark !== String(dark)) stage.dataset.dark = String(dark);
    const di = Math.round(pos); if (di !== this.state.dayI) this.setState({ dayI: di });
  }
  // Auto-advance on wider screens: each stop dwells, then the row scrolls to the next one and loops back to the
  // morning after the evening stop. It waits while the pointer is over the section, an overlay is open, the tab is
  // hidden, or the visitor scrolled / dragged / tapped the carousel in the last few seconds. Phones never auto-advance.
  dayAutoTick(now) {
    const dt = now - (this._dayPrev || now); this._dayPrev = now;
    const el = this.day.current; if (!el) return;
    if (dayMobile() || reduceMotionNow()) { this._dayAcc = 0; return; }
    const r = el.getBoundingClientRect(), inView = r.top < innerHeight * 0.85 && r.bottom > innerHeight * 0.15;
    if (!inView || this._dayPaused || this.overlayOpen() || document.visibilityState !== 'visible') return;
    if (this._dayUserT && now - this._dayUserT < 12000) { this._dayAcc = 0; return; }
    const n = SC().stops.length; if (n < 2) return;
    this._dayAcc = (this._dayAcc || 0) + dt;
    if (this._dayAcc >= 4200) { const i = this.state.dayI || 0; this.scrollDayTo(i >= n - 1 ? 0 : i + 1, false); }
  }
  // '+ Add' from the story: same cart as the menu, with the product thumbnail flying to the cart bar
  storyAdd(m, chapter, e) {
    if (!m || !m.available) return;
    const from = e && e.currentTarget && e.currentTarget.closest('[data-fly]'), img = from && from.querySelector('img');
    this.add(m.id);
    TRACK('story_add_to_cart', { chapter, item_name: m.name, price: m.price });
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bump = () => { const bar = document.querySelector('[data-cartbar]'); if (bar && bar.animate) bar.animate([{ transform: 'translateX(-50%) scale(1)' }, { transform: 'translateX(-50%) scale(1.08)' }, { transform: 'translateX(-50%) scale(1)' }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' }); };
    if (!img || reduce || !img.animate) { setTimeout(bump, 60); return; }
    const r = img.getBoundingClientRect(), ghost = img.cloneNode();
    Object.assign(ghost.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', margin: 0, zIndex: 90, borderRadius: '16px', objectFit: 'cover', pointerEvents: 'none', boxShadow: '0 16px 40px rgba(13,13,13,.25)' });
    document.body.appendChild(ghost);
    requestAnimationFrame(() => {
      const bar = document.querySelector('[data-cartbar]'), t = bar ? bar.getBoundingClientRect() : { left: innerWidth / 2 - 20, top: innerHeight - 60, width: 40, height: 40 };
      const dx = t.left + t.width * 0.18 - r.left - r.width / 2, dy = t.top + t.height / 2 - r.top - r.height / 2;
      ghost.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 80) + 'px) scale(.6)', opacity: 1, offset: 0.5 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.18)', opacity: 0.2 }], { duration: 720, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => { ghost.remove(); bump(); };
    });
  }
  // ---- CH 05 video = the site's music: starts muted, sound on at the first tap/click/key, keeps playing while the
  // visitor scrolls, pauses only while an overlay (menu / order / checkout / history / product) is open or the tab is hidden.
  overlayOpen() { const st = this.state; return !!(st.checkout || st.full || st.hist || st.sel || st.cl); }
  cVidLive() { return !this.overlayOpen() && document.visibilityState === 'visible'; }
  ctlCareVid() {
    const v = this.careVid.current; if (!v) return;
    if (!v.loop) { v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); }
    v.muted = !this.state.cSound;
    if (this.cVidLive()) { if (v.paused) v.play().catch(() => { if (!v.muted) { v.muted = true; this.setState({ cSound: false }); v.play().catch(() => {}); } }); }
    else if (!v.paused) v.pause();
  }
  setupCareVid() { /* Music removed for load performance: the care-section video no longer loads or plays, so no sound/unmute machinery is wired up. */ }
  // ---- CH 04 quiz ----
  quizAnswer(qid, val) {
    const qs = SC().quiz.questions, i = this.state.qi || 0;
    if (this.state.qPick) return;
    if (i === 0) TRACK('quiz_start', {});
    this.setState({ qPick: val });
    setTimeout(() => {
      const qa = { ...(this.state.qa || {}), [qid]: val }, next = i + 1;
      if (next < qs.length) { this.setState({ qa, qi: next, qPick: null }); return; }
      const r = this.quizResult(qa); const ni = SC().needs.indexOf(r.need);
      this.setState({ qa, qi: next, qPick: null, ...(ni >= 0 ? { need: ni } : {}) });
      TRACK('quiz_complete', { result_item: r.items[0] ? r.items[0].name : '' });
    }, reduceMotionNow() ? 0 : 280);
  }
  quizResult(qa) {
    const Q = SC().quiz, ok = x => x && x.available;
    const rule = (Q.rules || []).find(r => Object.keys(r.when || {}).every(k => qa[k] === r.when[k]));
    let items = rule ? this.pickItems(rule.items) : [];
    if (!items.length) items = this.menuAll().filter(m => ok(m) && m.cat === Q.fallbackCategory).slice(0, 3);
    if (!items.length) items = this.menuAll().filter(ok).slice(0, 3);
    return { items: items.slice(0, 3), reason: rule && items.length ? rule.reason : Q.fallbackReason, need: rule ? rule.need : null };
  }
  goTo(elId) { const el = document.getElementById(elId); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (elId === 'order' ? 90 : 0), behavior: 'smooth' }); }
  // ---- menu (from POS via cafe_get_web_menu) ----
  // Menu is cached in the browser: repeat visits show it (and its photos) instantly, then refresh from the server.
  loadMenu() {
    this.setState({ menuErr: '' });
    if (this.state.menu === null) { try { const c = JSON.parse(localStorage.getItem(MENU_CACHE) || 'null'); if (c && Array.isArray(c.items) && Date.now() - c.at < 7 * 864e5) this.setState({ menu: c.items.map(toItem) }); } catch (e) {} }
    API().getMenu().then(res => { this.setState({ menu: (res.items || []).map(toItem) }); try { localStorage.setItem(MENU_CACHE, JSON.stringify({ at: Date.now(), items: res.items || [] })); } catch (e) {} })
      .catch(e => this.setState(s => (s.menu ? {} : { menuErr: e.message || 'Menu unavailable' })));
  }
  // Menu in group order (drinks first); the original order is kept inside a group.
  menuAll() {
    const m = this.state.menu || [];
    if (this._sortedFor !== m) { this._sortedFor = m; this._sorted = m.map((x, i) => [x, i]).sort((a, b) => (catRank(a[0].cat) - catRank(b[0].cat)) || (a[0].cat < b[0].cat ? -1 : a[0].cat > b[0].cat ? 1 : 0) || (a[1] - b[1])).map(p => p[0]); }
    return this._sorted;
  }
  byId(id) { return this.menuAll().find(x => x.id === id); }
  // Landing products are referenced by web menu id ({ id, name } in StoryConfig; name is only a note for editors).
  byRef(r) { const id = r && typeof r === 'object' ? r.id : r; return id ? this.byId(String(id)) || null : null; }
  // Story picks: only products that are on the menu and available, in config order. A missing one is left out
  // (never swapped for another product).
  pickItems(refs, n = 3) { return (refs || []).map(r => this.byRef(r)).filter(x => x && x.available).slice(0, n); }
  price(m) { return m ? m.price : 0; }
  // One product card of the FULL MENU (price, add / stepper, photo).
  card(x) {
    return ({ ...x, nameWrap: String(x.name).replace(/\//g, '/\u200b'), priceFmt: rp(this.price(x)), add: () => this.add(x.id), soldOut: !x.available, addLabel: !x.available ? 'Sold out' : '+ Add',
        // card stepper: [ − ] qty [ + ] once the item is in the cart (qty = all its lines), "+ Add" otherwise
        qty: this.qtyOf(x.id), noQty: !x.available || !this.qtyOf(x.id), hasQty: !!x.available && this.qtyOf(x.id) > 0, dec: () => this.dec(x.id),
        decLabel: 'Remove one ' + x.name, incLabel: 'Add one more ' + x.name,
        addStyle: this.addStyle(x.available, false), addStyleSm: this.addStyle(x.available, true), src: this.src(x.imgs[0]), imgStyle: this.imgStyle(this.src(x.imgs[0]), 'cover'), open: () => this.setState({ sel: x.id }) });
  }
  // cart: { [lineKey]: { id, opts, qty } }
  // Every change goes through CafeApi.cartSet (localStorage + 'cart' event); the subscription in componentDidMount
  // puts it back in state, so the menu, story, pop-up and checkout always show the same cart.
  setCart(next) { const c = API().cartSet(next); this.setState({ cart: c }); }
  add(id, opts) {
    const m = this.byId(id); if (!m || !m.available) return;
    const o = opts || defaultOpts(m), k = lineKey(id, o), c = this.state.cart;
    this.setCart({ ...c, [k]: { id, opts: o, qty: ((c[k] || {}).qty || 0) + 1 } });
  }
  // − on a menu card: takes one off the plain (default options) line first, else the newest line of that item.
  dec(id) {
    const m = this.byId(id), c = this.state.cart, keys = Object.keys(c).filter(k => c[k].id === id); if (!keys.length) return;
    const dk = m ? lineKey(id, defaultOpts(m)) : null, k = keys.includes(dk) ? dk : keys[keys.length - 1];
    this.setCart({ ...c, [k]: { ...c[k], qty: c[k].qty - 1 } });
  }
  // Table QR scanned: remember the table, open FULL MENU right away (never a blank page), then let the backend
  // confirm the token. Invalid → "QR meja tidak valid" and the visitor simply continues as Grab n Go.
  tableScan(token) {
    const A = API(), hours = 4;
    A.tableSessionSet({ token, at: Date.now(), until: Date.now() + hours * 36e5 });
    try { history.replaceState(null, '', '/#menu'); } catch (e) {}
    this.openFullMenu();
    A.tableResolve(token).then(r => {
      if (r && r.ok) {
        const h = Number(r.session_hours) || hours;
        A.tableSessionSet({ token, table_id: r.table_id, code: r.code, label: r.label, at: Date.now(), until: Date.now() + h * 36e5 });
        // the FULL MENU banner "DINE-IN · MEJA 7" shows it (no toast: it would cover the cart / confirm modal)
      } else if (r && r.ok === false) {
        A.tableSessionClear();
        this.showToast(r.error || 'QR meja tidak valid, silakan tanya kasir');
      }
    }).catch(() => {});  // backend not updated yet: keep the remembered table, the menu still works
  }
  // Fase 3 · counter "QR Claim Order" (#claim/{token}): this phone's paid Grab n Go orders of today, CLAIM sends one to
  // the barista queue. Ordered on another phone → find it by order / queue code + name or WhatsApp number.
  openClaim(token) {
    API().claimPointSet(token);
    this.setState({ cl: { token, phase: 'loading', orders: [], close: '21:00', busy: null, msg: {}, done: null, fCode: '', fWho: '', fBusy: false, fMsg: '', more: false }, full: false, hist: false, sel: null, checkout: false });
    this.loadClaim();
  }
  clSet(patch) { this.setState(s => (s.cl ? { cl: { ...s.cl, ...(typeof patch === 'function' ? patch(s.cl) : patch) } } : null)); }
  loadClaim() {
    const c = this.state.cl; if (!c) return;
    this.clSet({ phase: 'loading', err: '' });
    API().claimMine(c.token, API().getRefs()).then(r => {
      if (!r || r.ok === false) { this.clSet({ phase: 'invalid', err: (r && r.error) || 'QR Claim tidak valid. Silakan tanya kasir.' }); return; }
      const orders = r.orders || [];
      this.clSet({ phase: 'ok', orders, close: r.close_time || '21:00', more: !orders.length });
    }).catch(() => this.clSet({ phase: 'error', err: 'Gagal memuat order. Cek koneksi lalu coba lagi.' }));
  }
  claimIt(o) {
    const c = this.state.cl; if (!c || c.busy) return;
    this.clSet(x => ({ busy: o.code, msg: { ...x.msg, [o.code]: '' } }));
    API().claimOrder(c.token, o.code).then(r => {
      if (r && r.ok) { this.clSet({ busy: null, done: r.order }); this.refreshHist(false); return; }
      this.clSet(x => ({ busy: null, msg: { ...x.msg, [o.code]: (r && r.error) || 'Gagal claim, coba lagi' } }));
    }).catch(() => this.clSet(x => ({ busy: null, msg: { ...x.msg, [o.code]: 'Gagal claim. Cek koneksi lalu coba lagi.' } })));
  }
  claimFind() {
    const c = this.state.cl; if (!c || c.fBusy) return;
    if ((c.fCode || '').trim().length < 2 || (c.fWho || '').trim().length < 2) { this.clSet({ fMsg: 'Isi kode order / antrean dan nama atau nomor WhatsApp.' }); return; }
    this.clSet({ fBusy: true, fMsg: '' });
    API().claimFind(c.token, c.fCode.trim(), c.fWho.trim()).then(r => {
      if (r && r.ok) { API().addRef({ code: r.code, token: r.token, kind: 'order' }); this.clSet({ fBusy: false, done: r.order }); return; }
      this.clSet({ fBusy: false, fMsg: (r && r.error) || 'Order tidak ditemukan' });
    }).catch(() => this.clSet({ fBusy: false, fMsg: 'Gagal mencari order. Cek koneksi lalu coba lagi.' }));
  }
  closeClaim(toHist) {
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    this.setState({ cl: null });
    if (toHist) this.openHist();
  }
  claimVals() {
    const c = this.state.cl, rp = n => 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID');
    if (!c) return { clOpen: false };
    const items = o => (o.items || []).map(i => i.qty + '× ' + i.name).join(', ');
    const d = c.done;
    return {
      clOpen: true, clLoading: c.phase === 'loading', clBad: c.phase === 'invalid' || c.phase === 'error', clErr: c.err || '',
      clRetry: c.phase === 'error', clReload: () => this.loadClaim(),
      clOk: c.phase === 'ok' && !d, clDone: !!d,
      clClose: () => this.closeClaim(false), clToHist: () => this.closeClaim(true),
      clUntil: 'Claim Grab n Go sampai ' + (c.close || '21:00') + ' hari ini',
      clHasOrders: !!(c.orders || []).length, clNone: !(c.orders || []).length,
      clOrders: (c.orders || []).map(o => {
        const busy = c.busy === o.code, can = !!o.claimable;
        return { key: o.code, code: o.queue_code ? '#' + o.queue_code : o.code, sub: o.queue_code ? o.code : '', name: o.customer_name || '-', items: items(o), total: rp(o.total),
          can, reason: can ? '' : (o.reason || ''), msg: (c.msg || {})[o.code] || '', hasMsg: !!(c.msg || {})[o.code],
          btn: busy ? 'Memproses…' : 'Claim order ' + (o.queue_code ? '#' + o.queue_code : ''), go: () => this.claimIt(o),
          btnStyle: { all: 'unset', cursor: can && !busy ? 'pointer' : 'default', boxSizing: 'border-box', width: '100%', minHeight: 52, padding: '0 18px', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: can ? '#e30a2e' : 'rgba(13,13,13,.12)', color: can ? '#fff' : 'rgba(13,13,13,.45)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 20, textTransform: 'uppercase', letterSpacing: '.03em', opacity: busy ? .7 : 1 } };
      }),
      clMore: !!c.more, clToggleMore: () => this.clSet(x => ({ more: !x.more })), clMoreLabel: c.more ? 'Tutup' : 'Pesan dari HP lain?',
      clFCode: c.fCode || '', clFWho: c.fWho || '', clFMsg: c.fMsg || '', clFBusy: !!c.fBusy,
      clSetFCode: e => this.clSet({ fCode: e.target.value }), clSetFWho: e => this.clSet({ fWho: e.target.value }),
      clFind: () => this.claimFind(), clFindLabel: c.fBusy ? 'Mencari…' : 'Cari & claim',
      clDoneCode: d ? (d.queue_code ? '#' + d.queue_code : d.code) : '', clDoneSub: d && d.queue_code ? d.code : '',
      clDoneName: d ? d.customer_name || '' : '', clDoneItems: d ? items(d) : '',
    };
  }
  // FULL MENU: View Menu / Full menu / #menu / #order all open it on the "All" tab.
  openFullMenu() { this.setState({ full: true, hist: false, sel: null, tab: 'All' }); setTimeout(() => this.hintTabs(true), 450); }
  // Category chips are one scrollable row: fade + "›" while more chips are to the right, hidden at the end / when all fit.
  // nudge = a one-time small slide when the FULL MENU opens, so it reads as scrollable.
  hintTabs(nudge) {
    document.querySelectorAll('.fx-tabs-wrap').forEach(w => {
      const row = w.querySelector('.fx-tabs'); if (!row) return;
      const update = () => { w.classList.toggle('fx-no-more', row.scrollLeft + row.clientWidth >= row.scrollWidth - 48); w.classList.toggle('fx-scrolled', row.scrollLeft > 8); };
      if (!row.__fxHint) { row.__fxHint = true; row.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); }
      update();
      if (nudge && !w.classList.contains('fx-no-more') && !reduceMotionNow()) { row.classList.remove('fx-nudge'); void row.offsetWidth; row.classList.add('fx-nudge'); setTimeout(() => row.classList.remove('fx-nudge'), 1000); }
    });
  }
  qtyOf(id) { return Object.values(this.state.cart).filter(l => l.id === id).reduce((a, l) => a + l.qty, 0); }
  selOpts(m) { const p = this.state.pick[m.id]; return p || defaultOpts(m); }
  pickOpt(m, g, optId) { const cur = this.selOpts(m).filter(id => !(g.options || []).some(o => o.id === id)); this.setState(s => ({ pick: { ...s.pick, [m.id]: cur.concat([optId]) } })); }
  // ---- purchase history (cafe_get_my_orders) ----
  refreshHist(first) {
    const refs = API().getRefs(); this.setState({ refs });
    if (!refs.length) { this.setState({ hList: [], hErr: '', hLoading: false, hDot: false }); this.syncWatch([]); return; }
    if (first) this.setState({ hLoading: true });
    API().getMyOrders().then(list => {
      const prev = this.state.hList || [];
      const flash = {};
      list.forEach(o => {
        const p = prev.find(x => x.code === o.code);
        if (p && p.status !== o.status) {
          flash[o.code] = Date.now();
          if (o.status === 'accepted' && o.type === 'pickup') this.showToast('Order ' + o.code + ' sudah diterima dan sedang disiapkan');
          if (o.status === 'ready') this.showToast(o.type === 'pickup' ? 'Order ' + o.code + ' siap diambil di bar' : 'Your order ' + o.code + ' is ready for pickup');
          if (o.status === 'checked_in') this.showToast('Checked in · ' + o.code + (o.checked_in_by ? ' · by ' + o.checked_in_by : ''));
        }
      });
      if (this.state.hist) API().markSeen(list);
      this.setState(s => ({ hList: list, hErr: '', hLoading: false, hFlash: { ...s.hFlash, ...flash }, hDot: !s.hist && API().hasUnseen(list) }));
      this.syncWatch(list);
    }).catch(e => this.setState({ hErr: e.message || 'error', hLoading: false }));
  }
  // realtime per open order (max 20 newest); unsubscribe when closed
  syncWatch(list) {
    this._w = this._w || {};
    const want = {};
    list.filter(o => o.is_open).slice(0, 20).forEach(o => { const t = API().tokenFor(o.code); if (t) want[t] = true; });
    Object.keys(this._w).forEach(t => { if (!want[t]) { this._w[t](); delete this._w[t]; } });
    Object.keys(want).forEach(t => { if (!this._w[t]) this._w[t] = API().watch(t, () => this.queueRefresh()); });
  }
  queueRefresh() { clearTimeout(this._rq); this._rq = setTimeout(() => this.refreshHist(false), 300); }
  showToast(text) { clearTimeout(this._tt); this.setState({ toast: text }); this._tt = setTimeout(() => this.setState({ toast: null }), 6000); }
  openHist() { this.setState({ hist: true, full: false, sel: null, hDot: false }); this.refreshHist(!this.state.hList); }
  rateOrder(o, key, n) {
    const r = { ...(this.state.rates[o.code] || { food: o.rating_food || 0, service: o.rating_service || 0, comment: o.rating_comment || '' }), [key]: n };
    this.setState(s => ({ rates: { ...s.rates, [o.code]: { ...r, saved: false, err: '' } } }));
    if (r.food && r.service) API().rate(o.code, r.food, r.service, r.comment).then(() => this.setState(s => ({ rates: { ...s.rates, [o.code]: { ...r, saved: true } } }))).catch(e => this.setState(s => ({ rates: { ...s.rates, [o.code]: { ...r, err: e.message } } })));
  }
  imAtCafe(o) { API().arrived(o.code).then(() => this.refreshHist(false)).catch(e => this.showToast(e.message)); }
  vAddInc(code, id) { this.setState(s => { const c = { ...(s.vAdd[code] || {}) }; c[id] = (c[id] || 0) + 1; return { vAdd: { ...s.vAdd, [code]: c } }; }); }
  vAddDec(code, id) { this.setState(s => { const c = { ...(s.vAdd[code] || {}) }; c[id] = Math.max(0, (c[id] || 0) - 1); return { vAdd: { ...s.vAdd, [code]: c } }; }); }
  vAddSubmit(o) {
    const cart = this.state.vAdd[o.code] || {};
    const items = Object.keys(cart).filter(id => cart[id] > 0).map(id => ({ menu_id: id, qty: cart[id] }));
    if (!items.length || this.state.vAddBusy[o.code]) return;
    this.setState(s => ({ vAddBusy: { ...s.vAddBusy, [o.code]: true } }));
    const w = window.open('', '_blank'); // open now (user gesture) → point at WhatsApp after
    API().addVenueRefreshment(o.code, null, items).then(res => {
      this.setState(s => ({ vAdd: { ...s.vAdd, [o.code]: {} }, vAddBusy: { ...s.vAddBusy, [o.code]: false } }));
      this.refreshHist(false);
      this.showToast('Tambahan terkirim · menunggu konfirmasi barista');
      const wa = 'https://wa.me/' + String(this.props.waNumber || '6285284200036').replace(/\D/g, '') + '?text=' + encodeURIComponent('Hi 20FIT Cafe, I added refreshment to venue booking ' + o.code + ' (ref ' + ((res && res.addendum_code) || '') + '). Please confirm availability.');
      if (w) w.location.href = wa; else window.open(wa, '_blank', 'noopener');
    }).catch(e => { if (w) w.close(); this.setState(s => ({ vAddBusy: { ...s.vAddBusy, [o.code]: false } })); this.showToast((e && e.message) || 'Gagal menambah refreshment'); });
  }
  findOrder() {
    this.setState({ findBusy: true, findMsg: '' });
    API().findOrder(this.state.findCode, this.state.findPhone).then(res => {
      if (res && res.error) { this.setState({ findBusy: false, findMsg: res.error }); return; }
      this.setState({ findBusy: false, findCode: '', findPhone: '', findMsg: 'Order added' }); this.refreshHist(false);
    }).catch(e => this.setState({ findBusy: false, findMsg: e.message }));
  }
  scrollRail(d) { const r = this.rail.current; if (r) r.scrollBy({ left: d * Math.min(r.clientWidth * 0.8, 600), behavior: 'smooth' }); }

  imgStyle(src, fit) {
    const s = { width: '100%', height: '100%', objectFit: fit, display: 'block', pointerEvents: 'none', userSelect: 'none' };
    if (isCut(src)) { s.objectFit = 'contain'; s.filter = 'drop-shadow(0 24px 30px rgba(13,13,13,.22))'; }
    else { s.objectFit = 'cover'; s.borderRadius = fit === 'contain' ? 28 : 20; if (fit === 'contain') s.boxShadow = '0 24px 50px rgba(13,13,13,.18)'; }
    return s;
  }
  list() { return this.menuAll().filter(m => this.state.tab === 'All' || m.cat === this.state.tab); }
  step(d) { const l = this.list(); if (!l.length) return; const i = l.findIndex(m => m.id === this.state.sel); this.setState({ sel: l[(i + d + l.length) % l.length].id }); }
  scrollMenu(tab) { if (tab) this.setState({ tab }); const el = document.getElementById('menu'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' }); }

  src(u) { const n = u.split('/').pop().replace('-scaled.jpg', ''); return (this.state.cut || {})[n] || u; }
  heroSrc() { return this.props.heroVideo || ''; }
  syncVid() {
    const v = this.vid.current, s = this.heroSrc(); if (!v || !s) return;
    if (v.getAttribute('src') !== s) { v.src = s; v.loop = true; v.playsInline = true; v.muted = !this.state.sound; }
    if (v !== this._vEl) { this._vEl = v; if (this._io) this._io.disconnect(); this._io = new IntersectionObserver(es => { this.vidSeen = es[es.length - 1].intersectionRatio >= 0.25; this.ctlVid(); }, { threshold: [0, 0.25, 0.6] }); this._io.observe(v); }
    this.ctlVid();
  }
  // The hero video only plays while it is on screen and nothing (menu, order, checkout, history) covers it,
  // so its music never runs underneath the ordering flow or while scrolling through the menu.
  vidLive() { const st = this.state; return !!this.vidSeen && !st.checkout && !st.full && !st.hist && !st.sel && !st.cl && document.visibilityState === 'visible'; }
  ctlVid() { const v = this.vid.current; if (!v) return; v.muted = !this.state.sound; if (this.vidLive()) { if (v.paused) v.play().catch(() => { if (!v.muted) { v.muted = true; this.setState({ sound: false }); v.play().catch(() => {}); } }); } else if (!v.paused) v.pause(); }
  componentDidUpdate() { this.syncVid(); const ov = this.overlayOpen(); if (ov !== this._ov) { this._ov = ov; this.ctlCareVid(); } }
  componentDidMount() {
    this._tabsHintT = setInterval(() => this.hintTabs(false), 1500);
    // A product photo that fails to load (e.g. a POS upload that no longer exists) shows the neutral
    // 20FIT CAFE placeholder instead of a broken-image icon. Capture phase: image errors do not bubble.
    if (!window.__cafeImgFallback) {
      window.__cafeImgFallback = true;
      document.addEventListener('error', e => { const t = e.target; if (t && t.tagName === 'IMG' && !t.dataset.fb && /^https?:/.test(t.currentSrc || t.src || '')) { t.dataset.fb = '1'; t.src = t.alt ? productArt(t.alt, '') : NO_PHOTO; } }, true);
    }
    this.loadMenu();
    // WhatsApp number for CH 07 comes from the POS web config (same source as checkout)
    setTimeout(() => { const A = API(); A && A.getConfig && A.getConfig().then(c => { if (c && c.wa_number) this.setState({ waCfg: String(c.wa_number) }); }).catch(() => {}); }, 1500);
    this.refreshHist(false);
    // Back from Xendit's payment page (?paid=CODE / ?order=CODE): show the order in Purchase History.
    try {
      const q = new URLSearchParams(location.search), back = q.get('paid') || q.get('order');
      if (back) { history.replaceState(null, '', location.pathname + location.hash); setTimeout(() => this.openHist(), 300); if (q.get('paid')) this.showToast('Payment received for ' + back + ' · confirming…'); }
    } catch (e) {}
    this._offRefs = API().on('refs', () => this.refreshHist(false));
    this._offCart = API().on('cart', c => this.setState({ cart: c }));
    // Table session (from a table QR): FULL MENU shows "DINE-IN · MEJA 7" while it lasts.
    this._offTable = API().on('table', t => this.setState({ table: t || null }));
    this.setState({ table: API().tableSessionGet() });
    // Deep links: #menu / #order open FULL MENU; #order/CAFE-XXXXX (or an unpaid order whose payment page was open)
    // opens that order's payment page again.
    this._hash = () => {
      const h = decodeURIComponent(location.hash || ''), mm = h.match(/^#order\/([A-Za-z0-9-]+)$/);
      // Table QR: #t/{token} (or /t/{token}) → FULL MENU, the table is remembered for the order (Fase 2 labels it).
      const tq = h.match(/^#t\/([A-Za-z0-9_-]{8,64})$/) || (location.pathname || '').match(/^\/t\/([A-Za-z0-9_-]{8,64})\/?$/);
      if (tq) { this.tableScan(tq[1]); return; }
      // Counter Claim QR: #claim/{token} (or /claim/{token}) → Claim Order screen (Fase 3).
      const cq = h.match(/^#claim\/([A-Za-z0-9_-]{8,64})$/) || (location.pathname || '').match(/^\/claim\/([A-Za-z0-9_-]{8,64})\/?$/);
      if (cq) { this.openClaim(cq[1]); return; }
      const open = API().payOpenGet();
      if (mm) { const code = mm[1].toUpperCase(), token = API().tokenFor(code) || (open && open.code === code ? open.token : null);
        if (token) { this.setState({ resume: { code, token }, checkout: true, full: false, sel: null, mode: 'grab' }); return; }
        try { history.replaceState(null, '', location.pathname + '#order'); } catch (e) {}
        this.openFullMenu(); return; }
      if (h === '#menu' || h === '#order') { if (!this.state.checkout) this.openFullMenu(); }
    };
    this._hash();
    window.addEventListener('hashchange', this._hash);
    this._poll = setInterval(() => { if (API().getRefs().length && (this.state.hist || (this.state.hList || []).some(o => o.is_open))) this.refreshHist(false); }, 20000);
    this._focus = () => { if (document.visibilityState === 'visible') this.refreshHist(false); };
    document.addEventListener('visibilitychange', this._focus); window.addEventListener('focus', this._focus);
    this._ig = setInterval(() => { this.setState(s => ({ igI: ((s.igI || 0) + 1) % IG_POSTS.length, igHold: true }), () => requestAnimationFrame(() => this.setState({ igHold: false }))); }, IG_MS);
    requestAnimationFrame(() => this.setState({ igHold: false }));
    this.syncVid();
    // Browsers only allow sound after a real tap/click/key, so the video starts muted and turns its sound on at
    // the visitor's first interaction (unless they pressed Mute). Scrolling is not an interaction, so keep listening.
    const UNMUTE_EVS = ['pointerdown', 'pointerup', 'keydown', 'touchend', 'click'];
    const stopUnmute = () => UNMUTE_EVS.forEach(ev => window.removeEventListener(ev, this._unmute, true));
    this._unmute = e => {
      if (e && e.target && e.target.closest && e.target.closest('[aria-label="Toggle sound"]')) return;
      const v = this.vid.current; if (this.state.userMuted || this.state.sound) return stopUnmute(); if (!v || this._unmuting) return;
      this._unmuting = true; v.muted = false;
      v.play().then(() => { this._unmuting = false; stopUnmute(); this.setState({ sound: true }, () => this.ctlVid()); }).catch(() => { this._unmuting = false; v.muted = true; if (this.vidLive()) v.play().catch(() => {}); });
    };
    UNMUTE_EVS.forEach(ev => window.addEventListener(ev, this._unmute, { capture: true, passive: true }));
    this._vVis = () => this.ctlVid(); document.addEventListener('visibilitychange', this._vVis);
    this._hs = () => { const y = Math.min(window.scrollY, 1200); if (Math.abs(y - this.state.hy) > 2) this.setState({ hy: y }); }; window.addEventListener('scroll', this._hs, { passive: true }); setTimeout(() => this.setState({ heroIn: true }), 120);
    
    // landing story: chapters on this page, scroll-driven CH 03, chapter rail / progress bar
    this.setupCareVid();
    // CH 05 pillars + CH 06 cards animate in once they are on screen
    this._reveal = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const k = e.target.dataset.reveal; if (k && !this.state[k]) this.setState({ [k]: true }); this._reveal.unobserve(e.target); }), { threshold: 0.25 });
    setTimeout(() => document.querySelectorAll('[data-reveal]').forEach(el => this._reveal.observe(el)), 700);
    this._chs = SC().chapters.filter(c => document.getElementById(c.el));
    this._sraf = 0; this._story = () => { if (this._sraf) return; this._sraf = requestAnimationFrame(() => { this._sraf = 0; this.storyTick(); }); };
    window.addEventListener('scroll', this._story, { passive: true }); window.addEventListener('resize', this._story);
    setTimeout(() => { this._chs = SC().chapters.filter(c => document.getElementById(c.el)); this.storyTick(); }, 600);
    // CH 03 day carousel auto-advance (wider screens) — pauses while the pointer is over the section
    this._dayAcc = 0; this._dayPrev = 0; this._dayPaused = false; this._dayUserT = 0;
    setTimeout(() => { const de = this.day.current; if (de) { de.addEventListener('pointerenter', () => { this._dayPaused = true; }); de.addEventListener('pointerleave', () => { this._dayPaused = false; }); } }, 600);
    // the day timeline is a horizontal swipe / scroll carousel — keep the clock / sky / active stop in sync with its scroll
    setTimeout(() => { const dt = this.dayTrack.current; if (dt) { this._dayScroll = () => { if (this._dayScrollRaf) return; this._dayScrollRaf = requestAnimationFrame(() => { this._dayScrollRaf = 0; this.daySync(); }); }; dt.addEventListener('scroll', this._dayScroll, { passive: true }); this.setupDayDrag(); this.daySync(); } }, 600);
    this._dayTimer = setInterval(() => { try { this.dayAutoTick(performance.now()); } catch (e) {} }, 33);
    this._key = e => {
      if (e.key === 'Escape' && this.state.cl) { this.closeClaim(false); return; }
      if (!this.state.sel) { if (e.key === 'Escape' && this.state.full && !this.state.checkout) this.setState({ full: false }); return; }
      if (e.key === 'Escape') this.setState({ sel: null }); if (e.key === 'ArrowRight') this.step(1); if (e.key === 'ArrowLeft') this.step(-1); };
    window.addEventListener('keydown', this._key);
    const loop = () => {
      const t = performance.now() / 1000;
      document.querySelectorAll('[data-spin]').forEach(el => {
        const s = el._s || (el._s = { rot: 0, drag: false });
        if (!s.drag) s.rot += (Math.sin(t * 0.7) * (this.props.idleSwing ?? 35) - s.rot) * 0.04;
        const r = Math.max(-90, Math.min(90, s.rot));
        const card = el.querySelector('[data-card]'); if (card) card.style.transform = `translateX(${r / 90 * 14}%) rotate(${r / 90 * 4}deg)`;
        const v = el.querySelectorAll('[data-view]');
        if (v.length > 1) { const b = Math.max(0, Math.min(1, (r + 15) / 30)); v[0].style.opacity = 1 - b; v[1].style.opacity = b; }
        const sh = el.querySelector('[data-shadow]'); if (sh) sh.style.transform = `translateX(-50%) scaleX(${1 - Math.abs(r) / 90 * 0.45})`;
      });
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }
  componentWillUnmount() { clearInterval(this._tabsHintT); clearInterval(this._cWatch); if (this._cStop) this._cStop(); document.removeEventListener('visibilitychange', this._cVis); if (this._reveal) this._reveal.disconnect(); window.removeEventListener('scroll', this._story); window.removeEventListener('resize', this._story); if (this._io) this._io.disconnect(); document.removeEventListener('visibilitychange', this._vVis); ['pointerdown', 'pointerup', 'keydown', 'touchend', 'click'].forEach(ev => window.removeEventListener(ev, this._unmute, true)); clearInterval(this._ig); clearInterval(this._poll); this._offRefs && this._offRefs(); document.removeEventListener('visibilitychange', this._focus); window.removeEventListener('focus', this._focus); Object.values(this._w || {}).forEach(f => f()); ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(ev => window.removeEventListener(ev, this._unmute)); window.removeEventListener('scroll', this._hs); window.removeEventListener('keydown', this._key); window.removeEventListener('hashchange', this._hash); this._offCart && this._offCart(); this._offTable && this._offTable(); cancelAnimationFrame(this._raf); }

  viewer(m, key) {
    const h = React.createElement;
    const down = e => {
      const el = e.currentTarget; const s = el._s || (el._s = { rot: 0 });
      s.drag = true; const x0 = e.clientX, r0 = s.rot; el.setPointerCapture(e.pointerId);
      const mv = ev => { s.rot = Math.max(-90, Math.min(90, r0 + (ev.clientX - x0) * 0.6)); };
      const up = () => { s.drag = false; el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
      el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    };
    return h('div', { key: key + m.id, 'data-spin': m.cat === 'Food' ? 'slide' : '', onPointerDown: down, style: { position: 'absolute', inset: 0, perspective: 1100, cursor: 'grab', touchAction: 'pan-y', animation: key === 'pop' ? 'pPop .65s cubic-bezier(.2,.8,.2,1) both' : 'none' } },
      h('div', { style: { position: 'absolute', left: '8%', right: '8%', bottom: '2%', aspectRatio: '1', borderRadius: '50%', background: 'rgba(255,255,255,.4)', backdropFilter: 'blur(20px) saturate(170%)', WebkitBackdropFilter: 'blur(20px) saturate(170%)', border: '1px solid rgba(255,255,255,.9)', boxShadow: 'inset 0 1px 0 #fff, inset 0 -20px 40px rgba(227,10,46,.08), 0 30px 60px rgba(13,13,13,.1)' } }),
      h('div', { 'data-shadow': '', style: { position: 'absolute', left: '50%', bottom: '6%', width: '52%', height: '5%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(13,13,13,.35), transparent)' } }),
      h('div', { style: { position: 'absolute', inset: '0 0 8% 0', animation: 'pBob 4s ease-in-out infinite' } },
        h('div', { 'data-card': '', style: { position: 'absolute', inset: 0, transformStyle: 'preserve-3d', willChange: 'transform' } },
          m.imgs.map(u => this.src(u)).map((src, i) => h('img', { key: i, 'data-view': '', src, alt: m.name, draggable: false, style: { ...this.imgStyle(src, 'contain'), position: 'absolute', inset: 0, opacity: i ? 0 : 1 } }))
        )
      )
    );
  }

  addStyle(ok, small) {
    return small
      ? { all: 'unset', cursor: ok ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', padding: '8px 14px', borderRadius: 999, background: ok ? '#0d0d0d' : '#c9c7c2', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: '.04em', textTransform: 'uppercase' }
      : { all: 'unset', cursor: ok ? 'pointer' : 'not-allowed', boxSizing: 'border-box', textAlign: 'center', padding: 12, borderRadius: 999, background: ok ? '#0d0d0d' : '#c9c7c2', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: '.04em', textTransform: 'uppercase' };
  }
  histCard(o, active) {
    const A = API(), st = A.status(o), open = !!this.state.hOpen[o.code], venue = o.kind === 'venue';
    const r = this.state.rates[o.code] || { food: o.rating_food || 0, service: o.rating_service || 0, comment: o.rating_comment || '' };
    const paid = !venue && o.payment_status === 'paid';
    const stars = key => [1, 2, 3, 4, 5].map(n => ({ pick: () => this.rateOrder(o, key, n), style: { all: 'unset', cursor: 'pointer', fontSize: 20, lineHeight: 1, color: n <= (r[key] || 0) ? '#e30a2e' : 'rgba(13,13,13,.18)' } }));
    const flash = this.state.hFlash[o.code] && Date.now() - this.state.hFlash[o.code] < 2000;
    const addCart = this.state.vAdd[o.code] || {}, addCount = Object.values(addCart).reduce((a, n) => a + n, 0), addBusy = !!this.state.vAddBusy[o.code];
    const addSub = Object.keys(addCart).reduce((a, id) => { const mm = this.byId(id); return a + (mm ? mm.price : 0) * (addCart[id] || 0); }, 0);
    const price = venue ? [] : [['Subtotal', o.subtotal], ['Service', o.service_charge], ['PB1', o.ppn], ['Delivery', o.delivery_fee]].filter(([k, v]) => k === 'Subtotal' || Number(v) > 0).map(([k, v]) => ({ k, v: rp(v) }));
    return {
      code: o.code, kind: venue ? 'Venue' : A.KIND[o.type], dateFmt: A.dateTime(o.created_at), pill: st.pill, pillStyle: A.pillStyle(st), sub: st.sub, hasSub: !!st.sub,
      summary: venue ? (o.package === 'with_refreshments' ? 'With refreshments' : 'Venue only') + (Number(o.total) > 0 ? ' · ' + rp(o.total) : ' · est. ' + rp(o.est_price)) : (o.items || []).map(i => i.qty + '× ' + i.name).join(', ') || 'No menu items',
      method: venue ? (o.payment_status === 'paid' ? 'Paid' : 'Pay at cafe') : A.methodLabel(o.payment_method), totalFmt: venue ? (Number(o.total) > 0 ? rp(o.total) : '') : rp(o.total),
      cardStyle: { display: 'flex', flexDirection: 'column', gap: 12, padding: 20, borderRadius: 24, background: active ? '#fff' : 'rgba(255,255,255,.75)', border: active ? '2px solid #0d0d0d' : '1px solid rgba(255,255,255,.95)', boxShadow: active ? '0 16px 40px rgba(13,13,13,.10)' : 'inset 0 1px 0 #fff, 0 10px 30px rgba(13,13,13,.05)', animation: flash ? 'cafeFlash 1s ease 1' : 'none' },
      toggle: () => this.setState(s => ({ hOpen: { ...s.hOpen, [o.code]: !s.hOpen[o.code] } })), isOpen: open, moreLabel: open ? 'Hide details' : 'Details',
      // Venue requests: show the request itself (it has no menu items, prices or payment timeline)
      lines: venue ? (function () {
        var hm = t => (t ? String(t).slice(0, 5) : '-');
        var addSt = s => ({ pending_confirmation: 'menunggu', accepted: 'diterima', rejected: 'ditolak', cancelled_by_user: 'dibatalkan' })[s] || s;
        var L = [
          ['Event', String(o.event_type || '-').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())],
          ['Date', A.dayLabel(o.event_date)],
          ['Time', hm(o.start_time) + '–' + hm(o.end_time)],
          ['Guests', (o.guests || 0) + ' people'],
          ['Package', o.package === 'with_refreshments' ? 'With refreshments' : 'Venue only']
        ];
        if (o.serve_time) L.push(['Serving time', hm(o.serve_time)]);
        (o.items || []).forEach(i => L.push([i.qty + '× ' + i.name, rp(i.subtotal)]));
        (o.addendums || []).forEach(a => L.push(['+ ' + a.code + ' (' + addSt(a.status) + ')', rp(a.subtotal)]));
        L.push([Number(o.total) > 0 ? 'Total' : 'Estimated price', rp(Number(o.total) > 0 ? o.total : o.est_price)]);
        return L.map(([label, value]) => ({ label, opts: '', value }));
      })() : (o.items || []).map(i => ({ label: i.qty + '× ' + i.name, opts: A.optionsText(i.options), value: rp(i.subtotal) })),
      venueNote: venue ? (o.can_add ? 'Mau tambah refreshment? Chat kami di WhatsApp — tambahan dikonfirmasi barista dulu.' : o.status === 'new' ? 'The cafe will contact you on WhatsApp to confirm your booking.' : o.status === 'confirmed' ? 'Your venue booking is confirmed. See you there!' : '') : '',
      venueWa: venue && o.is_open !== false,
      venueWaLabel: venue && o.can_add ? 'Tambah refreshment via WhatsApp' : 'Chat WhatsApp',
      venueWaUrl: venue ? 'https://wa.me/' + String(this.props.waNumber ?? '6285284200036').replace(/\D/g, '') + '?text=' + encodeURIComponent('Hi 20FIT Cafe, about my venue booking ' + o.code + ' (' + A.dayLabel(o.event_date) + ', ' + (o.guests || 0) + ' guests).') : '',
      canAddRefresh: venue && !!o.can_add,
      addMenu: (venue && o.can_add) ? this.menuAll().filter(m => m.available !== false).map(m => ({ name: m.name, priceFmt: rp(m.price), qty: addCart[m.id] || 0, inc: () => this.vAddInc(o.code, m.id), dec: () => this.vAddDec(o.code, m.id), rowStyle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(13,13,13,.06)' } })) : [],
      addSubFmt: rp(addSub),
      addSubmit: () => this.vAddSubmit(o),
      addBtnLabel: addBusy ? 'Mengirim…' : addCount > 0 ? 'Kirim tambahan · ' + rp(addSub) : 'Pilih item dulu',
      addBtnStyle: { all: 'unset', boxSizing: 'border-box', width: '100%', cursor: (addCount > 0 && !addBusy) ? 'pointer' : 'not-allowed', textAlign: 'center', padding: 11, borderRadius: 999, background: (addCount > 0 && !addBusy) ? '#0d0d0d' : '#c9c7c2', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: '.04em', textTransform: 'uppercase' },
      price, hasPrice: price.length > 0,
      timeline: (o.timeline || []).map(t => ({ text: A.status({ ...o, status: t.to }).pill + ' · ' + A.time(t.at) + (t.by ? ' · ' + t.by : '') })), hasTimeline: !!(o.timeline && o.timeline.length),
      showQr: !venue && o.type === 'dine_in' && o.status === 'booked', qr: !venue && o.type === 'dine_in' && o.status === 'booked' && open ? React.createElement('div', { style: { width: 140, height: 140 }, dangerouslySetInnerHTML: { __html: A.qrSvg(o.code, 140) } }) : null,
      canArrive: false, arrive: () => {},  // guests are checked in by the barista only
      arrivedNote: false,
      canRate: paid, rates: [{ label: 'Food', stars: stars('food') }, { label: 'Service', stars: stars('service') }],
      rateMsg: r.err ? r.err : r.saved ? 'Thanks, rating saved' : (r.food && !r.service) || (!r.food && r.service) ? 'Rate both to save' : ''
    };
  }
  renderVals() {
    const { tab, sel } = this.state;
    const l = this.list();
    const m = this.byId(sel);
    const H = this.state.hList || [];
    const cfg = SC(), needLabel = cfg.needs[this.state.need] || 'Fueling', overlay = !!(this.state.checkout || this.state.full || this.state.hist || this.state.cl || m);
    const cartN = Object.values(this.state.cart).reduce((a, l) => a + l.qty, 0);
    const cartSum = Object.values(this.state.cart).reduce((a, l) => { const x = this.byId(l.id); return a + (x ? (x.price + optsPrice(x, l.opts)) * l.qty : 0); }, 0);
    const words = (t, on) => String(t).split(' ').map((w, k) => ({ w, style: { display: 'inline-block', marginRight: '.22em', opacity: on ? 1 : 0.12, transform: on ? 'none' : 'translateY(18px)', transition: 'opacity .5s ease ' + (k * 70) + 'ms, transform .6s cubic-bezier(.2,.8,.2,1) ' + (k * 70) + 'ms' } }));
    const story = {
      // CH 01 — scroll cue (hidden once the visitor starts scrolling)
      showCue: this.state.hy <= 80,
      // CH 03 — A day, fueled
      dayRef: this.day, dayStageRef: this.dayStage, dayTrackRef: this.dayTrack, dayHandRef: this.dayHand, dayMinRef: this.dayMin, dayTimeRef: this.dayTime, dayTime2Ref: this.dayTime2,
      dayStart: (cfg.stops[0] || {}).time || '06:00',
      dayStops: cfg.stops.map((st, i) => {
        const on = storyFlat() || i === (this.state.dayI || 0), pick = st.need === needLabel;
        const items = this.pickItems(st.items).map((x, k) => ({
          name: x.name, priceFmt: rp(x.price), src: this.src(x.imgs[0]), open: () => this.setState({ sel: x.id, tab: 'All' }),
          add: e => this.storyAdd(x, '03_day', e), addLabel: this.qtyOf(x.id) ? 'In cart · ' + this.qtyOf(x.id) : '+ Add',
          tileStyle: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, opacity: on ? 1 : 0.35, transform: on ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity .6s ease ' + (120 + k * 90) + 'ms, transform .7s cubic-bezier(.2,.8,.2,1) ' + (120 + k * 90) + 'ms' },
          photoStyle: { '--pi': i, display: 'block', width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 18, background: '#e8e6e1', boxShadow: '0 14px 34px rgba(13,13,13,.14)' } }));
        return { time: st.time, kicker: st.kicker, title: words(st.title, on), copy: st.copy, items, hasItems: items.length > 0, pick, need: st.need,
          cardStyle: { boxSizing: 'border-box', flex: '0 0 auto', display: 'grid', gap: 24, padding: 28, borderRadius: 32, background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(26px) saturate(170%)', WebkitBackdropFilter: 'blur(26px) saturate(170%)', border: '1px solid rgba(255,255,255,.9)',
            boxShadow: pick ? '0 0 0 2px #e30a2e, 0 24px 70px rgba(227,10,46,.22)' : 'inset 0 1px 0 #fff, 0 24px 60px rgba(13,13,13,.10)', color: '#0d0d0d', transition: 'box-shadow .4s' } };
      }),
      dayCartText: cartN ? cartN + ' in your cup · ' + rp(cartSum) : 'Your cup is empty',
      dayCartOn: cartN > 0, openCart: () => cartN && this.setState(s => ({ checkout: true, sel: null, full: false, mode: s.mode === 'venue' ? null : s.mode })),
      // CH 03 position dots + prev/next arrows; active follows the scroll carousel.
      dayPrev: () => this.dayStep(-1), dayNext: () => this.dayStep(1),
      dayPrevStyle: (() => { const off = (this.state.dayI || 0) <= 0; return { all: 'unset', cursor: off ? 'default' : 'pointer', boxSizing: 'border-box', width: 34, height: 34, borderRadius: 999, display: 'grid', placeItems: 'center', background: off ? 'rgba(13,13,13,.08)' : '#0d0d0d', color: off ? 'rgba(13,13,13,.3)' : '#fff', fontSize: 16, lineHeight: 1, transition: 'background .2s, color .2s' }; })(),
      dayNextStyle: (() => { const off = (this.state.dayI || 0) >= (cfg.stops || []).length - 1; return { all: 'unset', cursor: off ? 'default' : 'pointer', boxSizing: 'border-box', width: 34, height: 34, borderRadius: 999, display: 'grid', placeItems: 'center', background: off ? 'rgba(13,13,13,.08)' : '#0d0d0d', color: off ? 'rgba(13,13,13,.3)' : '#fff', fontSize: 16, lineHeight: 1, transition: 'background .2s, color .2s' }; })(),
      dayDots: (cfg.stops || []).map((st, i) => { const on = i === (this.state.dayI || 0);
        return { label: 'Go to ' + (st.time || ('stop ' + (i + 1))), go: () => this.scrollDayTo(i, true),
          style: { all: 'unset', cursor: 'pointer', boxSizing: 'border-box', width: on ? 22 : 8, height: 8, borderRadius: 999, background: on ? '#e30a2e' : 'rgba(140,140,140,.55)', transition: 'width .3s, background .3s' } }; }),
      // CH 04 — Find your fuel
      quizQ: (() => { const Q = cfg.quiz, i = this.state.qi || 0; if (!Q || i >= Q.questions.length) return null; return Q.questions[i]; })() ? 1 : 0,
      quizIsQ: !!(cfg.quiz && (this.state.qi || 0) < cfg.quiz.questions.length), quizIsResult: !!(cfg.quiz && (this.state.qi || 0) >= cfg.quiz.questions.length),
      quizNum: String(Math.min((this.state.qi || 0) + 1, 3)).padStart(2, '0') + ' / 03',
      quizTitle: cfg.quiz && cfg.quiz.questions[this.state.qi || 0] ? cfg.quiz.questions[this.state.qi || 0].q : '',
      quizBars: (cfg.quiz ? cfg.quiz.questions : []).map((_, i) => ({ style: { flex: 1, height: 4, borderRadius: 4, background: i < (this.state.qi || 0) ? '#e30a2e' : i === (this.state.qi || 0) ? 'rgba(227,10,46,.45)' : 'rgba(13,13,13,.12)', transition: 'background .3s' } })),
      quizOpts: (() => { const Q = cfg.quiz, i = this.state.qi || 0; if (!Q || i >= Q.questions.length) return []; const q = Q.questions[i];
        return q.options.map(([val, label]) => { const on = this.state.qPick === val; return { label, pick: () => this.quizAnswer(q.id, val),
          style: { all: 'unset', cursor: 'pointer', boxSizing: 'border-box', padding: '18px 26px', borderRadius: 999, border: '2px solid ' + (on ? '#e30a2e' : 'rgba(13,13,13,.14)'), background: on ? '#e30a2e' : 'rgba(255,255,255,.8)', color: on ? '#fff' : '#0d0d0d', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: '.02em', textTransform: 'uppercase', transition: 'background .2s, border-color .2s, transform .2s', transform: on ? 'scale(1.04)' : 'none' } }; }); })(),
      quizRes: (() => { if (!cfg.quiz || (this.state.qi || 0) < cfg.quiz.questions.length) return { name: '', priceFmt: '', src: NO_PHOTO, reason: '' };
        const r = this.quizResult(this.state.qa || {}), m = r.items[0];
        return m ? { name: m.name, priceFmt: rp(m.price), src: this.src(m.imgs[0]), reason: r.reason, add: e => this.storyAdd(m, '04_quiz', e), open: () => this.setState({ sel: m.id, tab: 'All' }), addLabel: this.qtyOf(m.id) ? 'In your order · ' + this.qtyOf(m.id) : 'Add to my order' } : { name: 'Menu is loading…', priceFmt: '', src: NO_PHOTO, reason: '' }; })(),
      quizAlts: (() => { if (!cfg.quiz || (this.state.qi || 0) < cfg.quiz.questions.length) return []; return this.quizResult(this.state.qa || {}).items.slice(1).map(x => ({ name: x.name, priceFmt: rp(x.price), src: this.src(x.imgs[0]), add: e => this.storyAdd(x, '04_quiz', e), open: () => this.setState({ sel: x.id, tab: 'All' }), addLabel: this.qtyOf(x.id) ? 'In cart · ' + this.qtyOf(x.id) : '+ Add' })); })(),
      quizAgain: () => this.setState({ qi: 0, qa: {}, qPick: null }),
      quizTeaser: (cfg.teasers.quiz || ''), toCare: () => this.goTo('care'),
      // CH 05 — Made with care
      careWords: (() => { const C = cfg.care || { headline: '', headlineRed: '' }; return String(C.headline).split(' ').map(w => ({ w, style: { opacity: 0.15, color: 'inherit', transition: 'opacity .25s linear' } }))
        .concat(String(C.headlineRed).split(' ').map(w => ({ w, style: { opacity: 0.15, color: '#e30a2e', transition: 'opacity .25s linear' } }))); })(),
      pillars: [],   // drink pillar cards removed — the care section now focuses on the autoplay video
      igPol: IG_POSTS.map((id, k) => ({ embed: 'https://www.instagram.com/' + id + '/embed/', poster: IG_PH,
        loaded: () => !(this.state.polOk || {})[k] && this.setState(s => ({ polOk: { ...(s.polOk || {}), [k]: true } })),
        frameStyle: { position: 'absolute', border: 0, opacity: (this.state.polOk || {})[k] ? 1 : 0, transition: 'opacity .6s', pointerEvents: 'none', ...IG_CROP[id.split('/')[0]] } })),
      careVidRef: this.careVid, careVidSrc: (cfg.care || {}).video || '',
      cSoundLabel: this.state.cSound ? '🔊 Mute' : '🔇 Sound on',
      cToggle: e => { if (e && e.stopPropagation) e.stopPropagation(); const v = this.careVid.current; if (!v) return; const on = !this.state.cSound; v.muted = !on; if (on && this.cVidLive()) v.play().catch(() => {}); this.setState({ cSound: on, cUserMuted: !on }); },
      showMusic: false,
      careTeaser: cfg.teasers.care || '', toOrderSec: () => this.goTo('order'),
      turnTeaser: cfg.teasers.turn || '', toFinale: () => this.goTo('finale'),
      // CH 07 — See you at the bar (details from config; 'TODO…' values stay hidden)
      fin: (() => { const F = cfg.finale || {}, real = v => v && !/^TODO/i.test(String(v));
        const wa = String(this.state.waCfg || this.props.waNumber || '6285284200036').replace(/\D/g, '');
        return { place: F.place || '20FIT', address: real(F.address) ? F.address : '', hours: real(F.hours) ? F.hours : '', hasAddress: real(F.address), hasHours: real(F.hours),
          ig: '@' + (F.instagram || '20fit.cafe'), igUrl: 'https://www.instagram.com/' + (F.instagram || '20fit.cafe') + '/',
          wa: '+' + wa.replace(/^(\d{2})(\d{3})(\d{4})(\d+)$/, '$1 $2-$3-$4'), waUrl: 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Hi 20FIT Cafe!') }; })(),
      // CH 06 — Your turn
      orderHasCart: cartN > 0, orderCartText: cartN + ' item' + (cartN > 1 ? 's' : '') + ' · ' + rp(cartSum) + ' — choose how to get it',
      modesStyle: { '--deal': this.state.orderIn || reduceMotionNow() ? 1 : 0, '--cart': cartN > 0 ? 1 : 0 },
      dayTeaser: document.getElementById('quiz') ? (cfg.teasers.day || '') : (cfg.teasers.dayFallback || ''),
      toAfterDay: () => this.goTo(document.getElementById('quiz') ? 'quiz' : 'order'),
      // Story navigation (rail on desktop, progress bar on phones); hidden while an overlay is open
      showStoryNav: !overlay,
      progRef: this.progBar,
      chapterLabel: ((this._chs || [])[this.state.ch || 0] || {}).label || '',
      chapters: (this._chs || []).map((c, i) => { const on = i === (this.state.ch || 0); return { label: String(cfg.chapters.indexOf(c) + 1).padStart(2, '0') + ' ' + c.label, go: () => this.goTo(c.el),
        dotStyle: { display: 'block', width: on ? 12 : 8, height: on ? 12 : 8, borderRadius: '50%', background: on ? '#e30a2e' : 'rgba(13,13,13,.28)', boxShadow: on ? '0 0 0 4px rgba(227,10,46,.18)' : 'none', transition: 'all .25s' } }; })
    };
    return {
      ...story,
      navs: [
        { label: 'Full Menu', short: 'Menu', go: () => this.setState({ full: true, hist: false, sel: null }) },
        { label: 'Book Venue', short: 'Venue', go: () => this.setState({ mode: 'venue', checkout: true, sel: null, full: false, hist: false }) },
        { label: 'Purchase History' + (this.state.refs.length ? ' (' + this.state.refs.length + ')' : ''), short: 'History' + (this.state.refs.length ? ' (' + this.state.refs.length + ')' : ''), go: () => this.openHist(), dot: this.state.hDot }
      ],
      heroVideo: this.heroSrc(), hasVideo: !!this.heroSrc(), vidRef: this.vid,
      vidMeta: e => { const v = e.target; if (v.videoWidth) this.setState({ vAR: v.videoWidth + '/' + v.videoHeight }); },
      soundLabel: this.state.sound ? '🔊 Mute' : '🔇 Sound on',
      toggleSound: e => { if (e && e.stopPropagation) e.stopPropagation(); const v = this.vid.current; if (!v) return; const on = !this.state.sound; v.muted = !on; if (on) v.play().catch(() => {}); this.setState({ sound: on, userMuted: !on }); },
      hasIg: !this.heroSrc() && !!igId(this.props.instagramUrl ?? IG_DEFAULT), igEmbed: igId(this.props.instagramUrl ?? IG_DEFAULT) ? 'https://www.instagram.com/' + igId(this.props.instagramUrl ?? IG_DEFAULT) + '/embed/' : '',
      igPosts: IG_POSTS.map((id, k) => ({ embed: 'https://www.instagram.com/' + id + '/embed/', poster: IG_POSTERS[k] ? U(IG_POSTERS[k]) : IG_PH, loaded: () => !(this.state.igOk || {})[k] && this.setState(s => ({ igOk: { ...(s.igOk || {}), [k]: true } })), style: { opacity: (this.state.igOk || {})[k] ? 1 : 0, transition: 'opacity .6s ease', position: 'absolute', border: 0, background: 'transparent', pointerEvents: 'none', ...IG_CROP[id.split('/')[0]] } })),
      igTrack: { position: 'absolute', inset: 0, display: 'flex', transform: 'translateX(' + (-100 * (this.state.igI || 0)) + '%)', transition: 'transform .9s cubic-bezier(.7,0,.2,1)' },
      igDots: IG_POSTS.map((_, i) => ({ style: { position: 'relative', width: 28, height: 3, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,.35)' }, fill: { position: 'absolute', left: 0, top: 0, bottom: 0, background: '#fff', width: i < (this.state.igI || 0) ? '100%' : i === (this.state.igI || 0) ? (this.state.igHold ? '0%' : '100%') : '0%', transition: i === (this.state.igI || 0) && !this.state.igHold ? 'width ' + IG_MS + 'ms linear' : 'none' } })),
      noMedia: !this.heroSrc() && !igId(this.props.instagramUrl ?? IG_DEFAULT),
      heroMove: e => { const r = e.currentTarget.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; cancelAnimationFrame(this._mr); this._mr = requestAnimationFrame(() => this.setState({ hx: x, hyM: y, hon: true, px: e.clientX - r.left, py: e.clientY - r.top })); },
      heroLeave: () => this.setState({ hx: 0, hyM: 0, hon: false }),
      spotStyle: { position: 'absolute', left: (this.state.px || 0) - 260, top: (this.state.py || 0) - 260, width: 520, height: 520, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(227,10,46,.16), rgba(227,10,46,0) 65%)', opacity: this.state.hon ? 1 : 0, transition: 'opacity .4s' },
      tiltStyle: { position: 'relative', zIndex: 1, transform: 'perspective(1000px) rotateY(' + (this.state.hx * 14) + 'deg) rotateX(' + (-this.state.hyM * 12) + 'deg)', transition: 'transform .25s ease-out', transformStyle: 'preserve-3d' },
      glareStyle: { position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(400px circle at ' + (50 + this.state.hx * 100) + '% ' + (50 + this.state.hyM * 100) + '%, rgba(255,255,255,.22), transparent 55%)', opacity: this.state.hon ? 1 : 0, transition: 'opacity .3s', mixBlendMode: 'soft-light' },
      badgeA: { position: 'absolute', left: 0, top: '18%', zIndex: 2, transform: 'translate(' + (this.state.hx * -36) + 'px,' + (this.state.hyM * -28) + 'px)', transition: 'transform .3s ease-out' },
      badgeB: { position: 'absolute', right: 0, bottom: '16%', zIndex: 2, transform: 'translate(' + (this.state.hx * 30) + 'px,' + (this.state.hyM * 24) + 'px)', transition: 'transform .3s ease-out' },
      needs: NEEDS().map((label, i) => { const on = this.state.need === i; return { label, pick: () => this.state.need !== i && this.setState({ need: i }), style: { all: 'unset', cursor: 'pointer', padding: '9px 16px', borderRadius: 999, whiteSpace: 'nowrap', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: '.04em', textTransform: 'uppercase', border: '1px solid ' + (on ? '#0d0d0d' : 'rgba(13,13,13,.18)'), background: on ? '#0d0d0d' : 'rgba(255,255,255,.6)', color: on ? '#fff' : '#0d0d0d', transition: 'all .2s' } }; }),
      // Product card under the hero: the POS product of the chosen chip (photo / name / price from the POS menu);
      // hidden while the menu loads or when that product is not on the menu / sold out.
      need: (() => { const m = this.pickItems([(cfg.heroPicks || [])[this.state.need]])[0], src = m ? this.src(m.imgs[0]) : '';
        return { kind: NEEDS()[this.state.need] || '', name: m ? m.name : '', price: m ? rp(m.price) : '', open: () => m && this.setState({ sel: m.id }), has: !!m,
          imgStyle: { width: 64, height: 64, flexShrink: 0, borderRadius: 14, backgroundColor: '#e8e6e1', backgroundImage: src ? 'url("' + src + '")' : 'none', backgroundSize: 'cover', backgroundPosition: 'center' } }; })(),
      needCardStyle: { all: 'unset', cursor: 'pointer', position: 'absolute', visibility: this.pickItems([(cfg.heroPicks || [])[this.state.need]]).length ? 'visible' : 'hidden', left: '-6%', bottom: '4%', zIndex: 3, display: 'flex', alignItems: 'center', gap: 12, padding: 10, paddingRight: 18, borderRadius: 20, background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.95)', boxShadow: '0 20px 50px rgba(13,13,13,.18)', maxWidth: 300, transform: 'translate(' + (this.state.hx * -22) + 'px,' + (this.state.hyM * -18) + 'px)', transition: 'transform .3s ease-out' },
      heroMediaStyle: { position: 'relative', zIndex: 1, height: 'clamp(520px, 74vh, 720px)', aspectRatio: this.props.heroVideo ? (this.state.vAR || '9/16') : '4/5', maxWidth: '100%', borderRadius: 28, overflow: 'hidden', background: 'linear-gradient(90deg,#e7e6e3 0%,#f3f2f0 45%,#e7e6e3 90%) 0 0/220% 100%', animation: 'skMove 1.25s ease-in-out infinite', boxShadow: '0 40px 90px rgba(13,13,13,.28), 0 0 0 1px rgba(255,255,255,.6) inset', transform: 'translateY(' + (this.state.hy * -0.1) + 'px)', willChange: 'transform' },
      // Pauses the About-section video (site music) while the menu / order / checkout / history / product view is open
      mediaHold: !!(this.state.checkout || this.state.full || this.state.hist || this.state.sel),
      // Fase 2: dine-in banner while a confirmed table session lasts ("Bukan di meja?" leaves table mode).
      ...this.claimVals(),
      hasTable: !!(this.state.table && this.state.table.label && (!this.state.table.until || Date.now() < this.state.table.until)),
      tableBanner: this.state.table && this.state.table.label ? 'Dine-in · ' + this.state.table.label : '',
      leaveTable: () => { API().tableSessionClear(); this.showToast('Mode meja dimatikan · pesanan jadi Grab n Go (ambil di counter)'); },
      showFull: this.state.full, openFull: () => this.openFullMenu(), closeFull: () => this.setState({ full: false }), fullBackdrop: e => { if (e.target === e.currentTarget) this.setState({ full: false }); },
      showHist: this.state.hist, closeHist: () => this.setState({ hist: false }),
      sub: this.state.sub || 'table',
      hLoading: this.state.hLoading && !H.length, hError: !!this.state.hErr && !H.length, retryHist: () => this.refreshHist(true),
      noOrders: !this.state.hLoading && !this.state.hErr && this.state.hList !== null && H.length === 0,
      hasActive: H.some(o => o.is_open), hasPast: H.some(o => !o.is_open),
      activeOrders: H.filter(o => o.is_open).map(o => this.histCard(o, true)),
      pastOrders: H.filter(o => !o.is_open).map(o => this.histCard(o, false)),
      findCode: this.state.findCode, findPhone: this.state.findPhone, findMsg: this.state.findMsg, findBusy: this.state.findBusy,
      setFindCode: e => this.setState({ findCode: e.target.value }), setFindPhone: e => this.setState({ findPhone: e.target.value }),
      doFind: () => !this.state.findBusy && this.findOrder(),
      hasToast: !!this.state.toast, toast: this.state.toast || '', closeToast: () => this.setState({ toast: null }),
      savePaid: () => this.refreshHist(false),  // the checkout empties the cart itself once the payment is received
      toMenu: () => this.openFullMenu(),
      openHero: () => this.setState({ sel: 'aren' }),
      toOrder: () => this.setState({ mode: null, checkout: true, sel: null, full: false }),
      waNumber: this.props.waNumber ?? '6285284200036',
      menuLite: this.menuAll().map(m => ({ id: m.id, name: m.name, cat: m.cat, price: m.price, base: m.base, src: this.src(m.imgs[0]), available: m.available, addons: m.addons })),
      tabsNext: e => { const w = e && e.currentTarget && e.currentTarget.closest('.fx-tabs-wrap'); const row = w && w.querySelector('.fx-tabs'); if (row) row.scrollBy({ left: Math.max(120, row.clientWidth * 0.6), behavior: 'smooth' }); },
      tabs: ['All'].concat([...new Set(this.menuAll().map(x => x.cat))]).map(t => ({ label: t, pick: () => this.setState({ tab: t }),
        style: { all: 'unset', cursor: 'pointer', padding: '9px 18px', borderRadius: 999, whiteSpace: 'nowrap', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: '.03em', textTransform: 'uppercase',
          background: t === tab ? '#e30a2e' : 'transparent', color: t === tab ? '#fff' : '#3a3a3a', transition: 'background .2s' } })),
      mode: this.state.mode || null,
      modeLabel: ({ dine: 'Dine-in · ', take: 'Takeaway · ' })[this.state.mode] || '',
      // Cafe is Grab & Go + Book Venue only. "Order" always opens the Grab & Go flow (checkout maps it to mode 'grab').
      pickGrab: () => this.setState({ mode: 'grab', checkout: true, sel: null, full: false }),
      pickVenue: () => this.setState({ mode: 'venue', checkout: true, sel: null, full: false }),
      railRef: this.rail, scrollPrev: () => this.scrollRail(-1), scrollNext: () => this.scrollRail(1),
      hasCart: !this.state.checkout && Object.keys(this.state.cart).length > 0,
      cartCount: Object.values(this.state.cart).reduce((a, l) => a + l.qty, 0),
      cartTotal: rp(Object.values(this.state.cart).reduce((a, l) => { const x = this.byId(l.id); return a + (x ? (x.price + optsPrice(x, l.opts)) * l.qty : 0); }, 0)),
      cartItems: Object.entries(this.state.cart).filter(([, l]) => this.byId(l.id)).map(([key, l]) => { const x = this.byId(l.id); return { key, id: l.id, opts: l.opts, name: x.name, optLabel: optsLabel(x, l.opts), price: x.price + optsPrice(x, l.opts), qty: l.qty }; }),
      showCheckout: this.state.checkout,
      openCheckout: () => this.setState(s => ({ checkout: true, sel: null, full: false, mode: s.mode === 'venue' ? null : s.mode })),
      closeCheckout: () => this.setState({ checkout: false, resume: null }),
      backToMenu: () => this.setState({ checkout: false, resume: null, full: true, hist: false, sel: null, tab: 'All' }),
      resume: this.state.resume,
      clearCart: () => this.setCart({}),
      addSel: () => m && this.add(m.id, this.selOpts(m)),
      addSelLabel: !m ? '' : !m.available ? 'Sold out' : (this.qtyOf(m.id) ? 'Add another (' + this.qtyOf(m.id) + ')' : '+ Order') + ' · ' + rp(m.price + optsPrice(m, this.selOpts(m))),
      hasAddons: !!(m && m.available && m.addons && m.addons.length),
      addonGroups: m ? (m.addons || []).map(g => ({ group: g.group, options: (g.options || []).map(o => { const on = this.selOpts(m).includes(o.id); return { label: o.label + (Number(o.price) ? ' +' + rp(o.price) : ''), pick: () => this.pickOpt(m, g, o.id),
        style: { all: 'unset', cursor: 'pointer', whiteSpace: 'nowrap', padding: '7px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: on ? '#0d0d0d' : 'rgba(255,255,255,.75)', color: on ? '#fff' : '#0d0d0d', border: '1px solid ' + (on ? '#0d0d0d' : 'rgba(13,13,13,.12)') } }; }) })) : [],
      menuLoading: this.state.menu === null && !this.state.menuErr, menuError: !!this.state.menuErr, retryMenu: () => this.loadMenu(),
      // FULL MENU in groups: on "All" one titled group per category (drinks first), otherwise one untitled group.
      menuGroups: (() => { const by = []; for (const x of l) { const k = tab === 'All' ? x.cat : ''; let g = by.find(z => z.key === k); if (!g) by.push(g = { key: k, label: k, showHead: tab === 'All', items: [] }); g.items.push(this.card(x)); } return by; })(),
      items: l.map(x => this.card(x)),
      hasSel: !!m, sel: m || {},
      counter: m ? m.cat + ' · ' + String(l.findIndex(x => x.id === sel) + 1).padStart(2, '0') + ' / ' + String(l.length).padStart(2, '0') : '',
      popView: m ? this.viewer(m, 'pop') : null,
      tiles: m ? (() => {
        const n = l.length, s = l.findIndex(x => x.id === sel);
        return l.map((x, j) => {
          let d = ((j - s) % n + n) % n; if (d > n / 2) d -= n;
          const th = d * 24, show = d !== 0 && Math.abs(d) <= 3;
          return { name: x.name, src: this.src(x.imgs[0]), pick: () => this.setState({ sel: x.id }),
            imgStyle: { display: 'block', width: '100%', height: '100%', backgroundImage: `url("${this.src(x.imgs[0])}")`, backgroundSize: 'cover', borderRadius: '22%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', pointerEvents: 'none' },
            style: { all: 'unset', cursor: 'pointer', position: 'absolute', left: '50%', top: 'calc(44% + 71vmin)', zIndex: 1, boxSizing: 'border-box',
              width: '18vmin', height: '18vmin', padding: '1.4vmin', borderRadius: '28%',
              background: 'rgba(255,255,255,.6)', backdropFilter: 'blur(18px) saturate(180%)', WebkitBackdropFilter: 'blur(18px) saturate(180%)',
              border: '1px solid rgba(255,255,255,.95)', boxShadow: 'inset 0 1px 0 #fff, 0 16px 36px rgba(13,13,13,.12)',
              transform: `translate(-50%,-50%) rotate(${th}deg) translateY(-76vmin)`,
              opacity: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none',
              transition: 'transform .8s cubic-bezier(.2,.8,.2,1), opacity .4s' } };
        });
      })() : [],
      hint: m && m.imgs.length > 1 ? 'Drag left or right to see the other side.' : 'Drag left or right to move it.',
      close: () => this.setState({ sel: null }), stop: e => e.stopPropagation(),
      prev: () => this.step(-1), next: () => this.step(1)
    };
  }
}
