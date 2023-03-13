using System.Collections;
using UnityEngine;
using System;
using UnityEngine.Networking;


public class ChartGen : MonoBehaviour
{
    // Start is called before the first frame update
    string base_url = "http://address:5500/station/chartgen.png?chart=";
    
    [SerializeField]
    private string Address = "localhost";

    public string Getaddress()
    { return Address; }
    public void Setaddress(string value)
    { Address = value; }


    void Start()
    {
        // getchartfromurl("");
        // GetKPI("260");
        // GetCycleTime("260");
        // GetSample("260", "oee", 80);
        // GetSample("260", "oee", 100, true);
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void GetKPI(string station)
    {
        getchartfromurl(base_url.Replace("station", station).Replace("address", Getaddress()) + "specKPI");
    }
    public void GetCycleTime(string station)
    {
        getchartfromurl(base_url.Replace("station", station).Replace("address", Getaddress()) + "specCycleTime");
    }
    public void GetSample(string station, string attr, int index1, int index2, GameObject go, bool isTall = false)
    {
        getchartfromurl(base_url.Replace("station", station).Replace("address", Getaddress()) + $"specSamples&attr={attr}&index={index1},{index2}" + (isTall ? "&size=tall" : ""), go, isTall);
    }

    public void getchartfromurl(String url)
    {
        StartCoroutine(GetRequest(url));
    }

    // generate sprite based on base64 string that came from server (save it too)  TODO: two functions, separate, maybe a good place for buffer
    void generateViz(string base64str)
    {
        byte[] Bytes = Convert.FromBase64String(base64str);
        
        Texture2D tex = new Texture2D(1200, 785); // ratio for 2144/1400 (26:17) with 1200 term
        tex.LoadImage(Bytes);
        Rect rect = new(0, 0, tex.width, tex.height);
        Sprite sprite = Sprite.Create(tex, rect, new Vector2(0, 0), 100f);
        SpriteRenderer renderer = this.gameObject.GetComponent<SpriteRenderer>();
        if (renderer == null)
        {
            renderer = this.gameObject.AddComponent<SpriteRenderer>(); // will crash if there's another renderer (like MeshRenderer) as component
        }
        renderer.sprite = sprite;

        PolygonCollider2D collider = gameObject.GetComponent<PolygonCollider2D>();
        if (collider == null)
            gameObject.AddComponent<PolygonCollider2D>();  //collider will be added after visualization render
    }

    // network connection and image download
    IEnumerator GetRequest(string uri)
    {
        using (UnityWebRequest webRequest = UnityWebRequest.Get(uri))
        {
            // Request and wait for the desired page.
            yield return webRequest.SendWebRequest();

            string[] pages = uri.Split('/');
            int page = pages.Length - 1;
            Debug.Log(uri);
            if (webRequest.result == UnityWebRequest.Result.ConnectionError)
            {
                Debug.Log(pages[page] + ": Error: " + webRequest.error);
            }
            else generateViz(webRequest.downloadHandler.text); // plain base64 string that (hopefully) came without any html tag

        }
    }
}
