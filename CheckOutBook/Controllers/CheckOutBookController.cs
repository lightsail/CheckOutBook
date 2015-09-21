using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CheckOutBook.Models;
using System.Web.Script.Serialization;

namespace CheckOutBook.Controllers
{
    public class CheckOutBookController : Controller
    {
        private static Random rng = new Random();

        public ViewResult Index()
        {
            return View("Index");
        }
    }
}
